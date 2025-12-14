export default function Test() {
  const handleModal = () => console.log("Modal clicked");

  return (
    <div className="w-[85%] mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-text">Truck List</h2>
          <p className="mt-1 text-muted">Manage your truck fleet</p>
        </div>
        <button
          onClick={handleModal}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition font-semibold shadow-md">
          + Add Truck
        </button>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-lg p-4 mb-6 shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by registration..."
            className="px-4 py-2 bg-background text-text rounded-lg border border-border focus:outline-none focus:ring-2 focus:border-primary"
          />
          <select className="px-4 py-2 bg-background text-text rounded-lg border border-border focus:outline-none focus:ring-2">
            <option>All Statuses</option>
            <option>Available</option>
            <option>In Service</option>
            <option>In Maintenance</option>
          </select>
          <select className="px-4 py-2 bg-background text-text rounded-lg border border-border focus:outline-none focus:ring-2">
            <option>All Brands</option>
            <option>Volvo</option>
            <option>Mercedes</option>
            <option>Scania</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="text-white bg-primary">
            <tr>
              <th className="px-6 py-4 text-left font-semibold">Registration</th>
              <th className="px-6 py-4 text-left font-semibold">Brand</th>
              <th className="px-6 py-4 text-left font-semibold">Model</th>
              <th className="px-6 py-4 text-left font-semibold">Year</th>
              <th className="px-6 py-4 text-left font-semibold">Mileage</th>
              <th className="px-6 py-4 text-left font-semibold">Status</th>
              <th className="px-6 py-4 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Row 1 */}
            <tr className="hover:bg-surface border-b border-border transition-colors duration-150">
              <td className="px-6 py-4 font-semibold">ABC-1234</td>
              <td className="px-6 py-4">Volvo</td>
              <td className="px-6 py-4">FH16</td>
              <td className="px-6 py-4">2021</td>
              <td className="px-6 py-4">145,320 km</td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 bg-success rounded-full text-white text-sm font-medium">Available</span>
              </td>
              <td className="px-6 py-4 text-center">
                <button onClick={handleModal} className="text-primary hover:underline font-medium mr-3">Edit</button>
                <button className="text-muted hover:underline font-medium">View</button>
              </td>
            </tr>
            {/* Row 2 */}
            <tr className="hover:bg-surface border-b border-border transition-colors duration-150">
              <td className="px-6 py-4 font-semibold">DEF-5678</td>
              <td className="px-6 py-4">Mercedes</td>
              <td className="px-6 py-4">Actros</td>
              <td className="px-6 py-4">2020</td>
              <td className="px-6 py-4">198,450 km</td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 bg-secondary text-text rounded-full text-sm font-medium">In Service</span>
              </td>
              <td className="px-6 py-4 text-center">
                <button onClick={handleModal} className="text-primary hover:underline font-medium mr-3">Edit</button>
                <button className="text-muted hover:underline font-medium">View</button>
              </td>
            </tr>
            {/* Row 3 */}
            <tr className="hover:bg-surface border-b border-border transition-colors duration-150">
              <td className="px-6 py-4 font-semibold">GHI-9012</td>
              <td className="px-6 py-4">Scania</td>
              <td className="px-6 py-4">R450</td>
              <td className="px-6 py-4">2019</td>
              <td className="px-6 py-4">256,780 km</td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 bg-[#ef4444] rounded-full text-white text-sm font-medium">In Maintenance</span>
              </td>
              <td className="px-6 py-4 text-center">
                <button onClick={handleModal} className="text-primary hover:underline font-medium mr-3">Edit</button>
                <button className="text-muted hover:underline font-medium">View</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
      <div className="flex justify-between items-center mt-6">
        <p className="text-muted">Showing 1 to 3 of 3 trucks</p>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-surface text-muted rounded-lg border border-border">Previous</button>
          <button
            style={{ backgroundColor: 'var(--color-primary)' }}
            className="px-4 py-2 rounded-lg text-white">
            1
          </button>
          <button className="px-4 py-2 bg-surface text-muted rounded-lg border border-border">Next</button>
        </div>
      </div>

    </div>
  );
}