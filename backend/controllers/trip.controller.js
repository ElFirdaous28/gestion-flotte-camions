import Trailer from '../models/Trailer.js';
import Trip from '../models/Trip.js';
import Truck from '../models/Truck.js';
import FuelEntry from '../models/FuelEntry.js';
import PDFDocument from 'pdfkit';
import { updateTargetKm } from '../services/updateTargetKm.js';
import { validateTripResources } from '../services/validateTripResources.js';
import User from '../models/User.js';

export const getTrips = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            type,
            search,
            order = 'desc'
        } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (type) filter.type = type;

        // Search: driver fullname OR locations
        if (search) {
            // find matching drivers first
            const drivers = await User.find({
                fullname: { $regex: search, $options: 'i' }
            }).select('_id');

            filter.$or = [
                { startLocation: { $regex: search, $options: 'i' } },
                { endLocation: { $regex: search, $options: 'i' } },
                { driver: { $in: drivers.map(d => d._id) } }
            ];
        }

        const skip = (page - 1) * limit;

        const [trips, total] = await Promise.all([
            Trip.find(filter)
                .populate('truck', 'plateNumber brand model')
                .populate('trailer', 'plateNumber type')
                .populate('driver', 'fullname email')
                .sort({ createdAt: order === 'asc' ? 1 : -1 })
                .skip(Number(skip))
                .limit(Number(limit)),
            Trip.countDocuments(filter)
        ]);

        res.status(200).json({
            message: 'Trips fetched successfully',
            trips,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        next(err);
    }
};

export const getTrip = async (req, res, next) => {
    try {
        const trip = await Trip.findById(req.params.id)
            .populate('truck trailer')
            .populate({ path: 'driver', select: '-password' });;
        if (!trip) return res.status(404).json({ message: 'Trip not found' });
        res.status(200).json(trip);
    } catch (err) {
        next(err);
    }
};

export const createTrip = async (req, res, next) => {
    try {
        const { truck, trailer, driver, startDate, endDate } = req.body;

        const error = await validateTripResources(
            truck,
            trailer,
            driver,
            new Date(startDate),
            new Date(endDate)
        );

        if (error) {
            return res.status(error.status).json({ message: error.message });
        }
        const trip = await Trip.create(req.body);
        res.status(201).json(trip);

    } catch (err) {
        next(err);
    }
};

export const updateTrip = async (req, res, next) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });

        if (trip.status !== 'to-do') {
            return res.status(400).json({ message: "Only trips with status 'to-do' status can be updated" });
        }

        trip.set(req.body);
        await trip.save();

        res.status(200).json(trip);
    } catch (err) {
        next(err);
    }
};

export const deleteTrip = async (req, res, next) => {
    try {
        const trip = await Trip.findByIdAndDelete(req.params.id);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });
        res.status(200).json({ message: 'Trip deleted successfully' });
    } catch (err) {
        next(err);
    }
};

export const startTrip = async (req, res, next) => {
    try {
        const { fuelStart } = req.body;

        // Find trip
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });

        // Can only start a "to-do" trip
        if (trip.status !== 'to-do') {
            return res.status(400).json({ message: 'Only trips with status "to-do" can be started' });
        }

        const truck = await Truck.findById(trip.truck);

        if (!truck) return res.status(404).json({ message: 'Truck not found' });

        // Update trip
        trip.status = 'in-progress';
        trip.fuelStart = fuelStart;
        trip.kmStart = truck.km;

        await trip.save();

        await Truck.findByIdAndUpdate(trip.truck, { status: 'on_trip' });
        await Trailer.findByIdAndUpdate(trip.trailer, { status: 'on_trip' });

        res.status(200).json(trip);

    } catch (err) {
        next(err);
    }
};


export const completeTrip = async (req, res, next) => {
    try {
        const { fuelEnd, kmEnd, notes, actualEndDate } = req.body;

        const trip = await Trip.findById(req.params.id);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        // only in-progress trips can be completed
        if (trip.status !== 'in-progress') {
            return res.status(400).json({
                message: "Only trips with status 'in-progress' can be completed"
            });
        }

        // calculate distance BEFORE modifying trip
        const distance = kmEnd - trip.kmStart;
        if (distance < 0) {
            return res.status(400).json({ message: 'Invalid kmEnd value' });
        }

        // update trip
        trip.status = 'completed';
        trip.fuelEnd = fuelEnd;
        trip.kmEnd = kmEnd;
        trip.actualEndDate = new Date(actualEndDate);
        if (notes) trip.notes = notes;

        await trip.save();

        // free resources
        await Promise.all([
            Truck.findByIdAndUpdate(trip.truck, { status: 'available' }),
            Trailer.findByIdAndUpdate(trip.trailer, { status: 'available' })
        ]);

        // 🔥 update KM consistently
        await Promise.all([
            updateTargetKm({
                targetType: 'truck',
                targetId: trip.truck,
                km: distance
            }),
            updateTargetKm({
                targetType: 'trailer',
                targetId: trip.trailer,
                km: distance
            })
        ]);

        res.status(200).json(trip);
    } catch (err) {
        next(err);
    }
};


export const getDriverTrips = async (req, res, next) => {
    try {
        const { driverId } = req.params;
        const { page = 1, limit = 10, status } = req.query;

        const filter = { driver: driverId };
        if (status) filter.status = status;

        const skip = (page - 1) * limit;

        const [trips, total] = await Promise.all([
            Trip.find(filter)
                .populate('truck', 'plateNumber brand')
                .populate('trailer', 'plateNumber type')
                .populate('driver', 'fullname')
                .sort({ createdAt: -1 }) // Newest first
                .skip(Number(skip))
                .limit(Number(limit)),
            Trip.countDocuments(filter)
        ]);

        res.status(200).json({
            message: 'Driver trips fetched successfully',
            trips,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        next(err);
    }
};


export const downloadTripReport = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Fetch Data
        const trip = await Trip.findById(id)
            .populate('truck')
            .populate('trailer')
            .populate('driver');

        if (!trip) return res.status(404).json({ message: 'Trip not found' });

        const fuelEntries = await FuelEntry.find({ trip: trip._id });
        const totalRefueled = fuelEntries.reduce((acc, curr) => acc + (curr.amount || 0), 0);

        // 2. Calculations
        const kmStart = trip.kmStart || 0;
        const kmEnd = trip.kmEnd || kmStart;
        const distance = kmEnd - kmStart;

        const fuelStart = trip.fuelStart || 0;
        const fuelEnd = trip.fuelEnd || 0;
        const consumptionTotal = (fuelStart + totalRefueled) - fuelEnd;
        const avgConsumption = distance > 0 ? ((consumptionTotal / distance) * 100).toFixed(1) : 0;

        const startDate = new Date(trip.startDate);
        const endDate = trip.actualEndDate ? new Date(trip.actualEndDate) : new Date(trip.endDate);
        const durationMs = endDate - startDate;
        const durationHours = Math.floor(durationMs / (1000 * 60 * 60));

        // Date Formatter
        const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '-';
        const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';

        // 3. Setup PDF
        const doc = new PDFDocument({ margin: 40, size: 'A4' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Rapport_${trip.serialNumber}.pdf`);
        doc.pipe(res);

        // --- STYLES ---
        const colors = {
            primary: '#1F2937', // Dark Grey/Black for professional look
            accent: '#17722f',  // Green accent
            border: '#e5e7eb',
            text: '#374151',
            headerBg: '#f3f4f6'
        };

        let y = 40;

        // --- HEADER (INVOICE STYLE) ---
        // Left: Company Info
        doc.fillColor(colors.accent).fontSize(20).font('Helvetica-Bold').text('FLOTTE TRANSPORT', 40, y);
        doc.fillColor(colors.text).fontSize(10).font('Helvetica').text('123 Zone Industrielle', 40, y + 25);
        doc.text('Casablanca, Maroc', 40, y + 38);
        doc.text('contact@flotte.com', 40, y + 51);

        // Right: Report Details
        doc.fillColor(colors.primary).fontSize(24).font('Helvetica-Bold').text('RAPPORT DE TRAJET', 0, y, { align: 'right' });
        doc.fillColor(colors.text).fontSize(10).font('Helvetica')
            .text(`Réf: ${trip.serialNumber}`, 0, y + 30, { align: 'right' });
        doc.text(`Date: ${fmtDate(new Date())}`, 0, y + 43, { align: 'right' });

        y += 80;

        // Separator
        doc.moveTo(40, y).lineTo(550, y).strokeColor(colors.accent).lineWidth(2).stroke();
        y += 20;

        // --- INFO GRID (FROM / TO) ---
        const col1 = 40;
        const col2 = 300;

        // Box 1: Vehicule & Chauffeur
        doc.fontSize(11).font('Helvetica-Bold').fillColor(colors.primary).text('DÉTAILS VÉHICULE & CHAUFFEUR', col1, y);
        y += 15;
        doc.fontSize(10).font('Helvetica').fillColor(colors.text);
        doc.text(`Chauffeur: ${trip.driver?.fullname || 'N/A'}`, col1, y);
        doc.text(`Camion: ${trip.truck?.plateNumber} (${trip.truck?.brand})`, col1, y + 15);
        doc.text(`Remorque: ${trip.trailer?.plateNumber || 'Aucune'}`, col1, y + 30);

        // Box 2: Route
        y -= 15; // Reset Y for second column header
        doc.fontSize(11).font('Helvetica-Bold').fillColor(colors.primary).text('DÉTAILS DU TRAJET', col2, y);
        y += 15;
        doc.fontSize(10).font('Helvetica').fillColor(colors.text);
        doc.text(`Départ: ${trip.startLocation}`, col2, y);
        doc.text(`Arrivée: ${trip.endLocation}`, col2, y + 15);
        doc.text(`Statut: ${trip.status.toUpperCase()}`, col2, y + 30);

        y += 60;

        // --- TABLE (INVOICE ITEMS) ---

        // Table Header
        const tableTop = y;
        const colX = { desc: 50, start: 200, end: 320, total: 450 };

        doc.rect(40, tableTop, 510, 25).fill(colors.headerBg);
        doc.fillColor(colors.primary).fontSize(10).font('Helvetica-Bold');
        doc.text('DESCRIPTION', colX.desc, tableTop + 8);
        doc.text('DÉPART', colX.start, tableTop + 8);
        doc.text('ARRIVÉE', colX.end, tableTop + 8);
        doc.text('TOTAL / DIFF', colX.total, tableTop + 8);

        y += 35;

        // Helper to draw a row
        const drawRow = (desc, start, end, total) => {
            doc.fillColor(colors.text).fontSize(10).font('Helvetica');
            doc.text(desc, colX.desc, y);
            doc.text(start, colX.start, y);
            doc.text(end, colX.end, y);
            doc.font('Helvetica-Bold').text(total, colX.total, y);

            // Bottom line
            y += 15;
            doc.moveTo(40, y).lineTo(550, y).strokeColor(colors.border).lineWidth(0.5).stroke();
            y += 15;
        };

        // Row 1: Distance
        drawRow('Kilométrage', `${kmStart} km`, `${kmEnd} km`, `${distance} km`);

        // Row 2: Fuel
        drawRow('Carburant (Niveau)', `${fuelStart} L`, `${fuelEnd} L`, `${consumptionTotal} L (Conso)`);

        // Row 3: Time
        const strStart = `${fmtDate(startDate)} ${fmtTime(startDate)}`;
        const strEnd = `${fmtDate(endDate)} ${fmtTime(endDate)}`;
        drawRow('Durée / Temps', fmtTime(startDate), fmtTime(endDate), `${durationHours} Heures`);

        // --- SUMMARY / TOTALS ---
        y += 10;
        const summaryBoxX = 350;
        doc.rect(summaryBoxX, y, 200, 60).fill(colors.headerBg); // Grey background for totals

        doc.fillColor(colors.text).font('Helvetica').fontSize(10);
        doc.text('Distance Totale:', summaryBoxX + 10, y + 10);
        doc.text('Consommation:', summaryBoxX + 10, y + 25);
        doc.font('Helvetica-Bold').text('Moyenne:', summaryBoxX + 10, y + 42);

        doc.font('Helvetica-Bold');
        doc.text(`${distance} km`, summaryBoxX + 120, y + 10, { align: 'right', width: 70 });
        doc.text(`${consumptionTotal} L`, summaryBoxX + 120, y + 25, { align: 'right', width: 70 });
        doc.fillColor(colors.accent).text(`${avgConsumption} L/100km`, summaryBoxX + 120, y + 42, { align: 'right', width: 70 });

        y += 80;

        // --- NOTES ---
        if (trip.notes) {
            doc.fontSize(10).font('Helvetica-Bold').fillColor(colors.primary).text('NOTES:', 40, y);
            doc.font('Helvetica').fillColor(colors.text).text(trip.notes, 90, y);
            y += 30;
        }

        // --- SIGNATURES (Bottom of Page) ---
        // Push to bottom
        const bottomY = 700;

        doc.fontSize(10).fillColor(colors.text).font('Helvetica-Bold');

        // Driver Sig
        doc.text('Signature Chauffeur', 50, bottomY);
        // Admin Sig
        doc.text('Signature Responsable', 300, bottomY);

        // Footer Text
        doc.fontSize(8).fillColor('#9ca3af').text('Ce document est généré informatiquement et ne nécessite pas de cachet.', 40, 760, { align: 'center', width: 515 });

        doc.end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'PDF Generation Error' });
    }
};