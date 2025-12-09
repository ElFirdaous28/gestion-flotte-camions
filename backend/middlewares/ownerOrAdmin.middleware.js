// Middleware to check if the authenticated user is 'admin' or the 'owner' of a resource
const checkAdminOrOwner = (Model, ownerField = '_id') => async (req, res, next) => {
    try {
        const resourceId = req.params.id;
        const user = req.user;

        if (!resourceId) return res.status(400).json({ message: 'Resource ID is missing.' });

        // Admin bypass
        if (user.role === 'admin') return next();

        const resource = await Model.findById(resourceId).select(ownerField);
        if (!resource) return res.status(404).json({ message: 'Resource not found.' });

        const ownerId = resource[ownerField]?.toString() || resource._id.toString();
        if (ownerId === user.id) return next();

        return res.status(403).json({ message: 'Access denied: not owner or admin.' });
    } catch (err) {
        return res.status(400).json({ message: 'Invalid resource ID.' });
    }
};

export default checkAdminOrOwner;
