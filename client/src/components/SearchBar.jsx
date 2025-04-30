// src/components/SearchBar.jsx
import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    project: '',
    priority: '',
    dueDate: ''
  });

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch({ query, ...filters });
  };

  return (
    <div className="relative">
      <form onSubmit={handleSearch}>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="w-5 h-5 text-accent absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent"
            />
          </div>
          <button
            type="button"
            className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20"
            onClick={() => document.getElementById('filters').showModal()}
          >
            Filters
          </button>
        </div>

        {/* Filter Modal */}
        <dialog id="filters" className="modal">
          <div className="modal-box bg-white p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-dark mb-4">Search Filters</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-accent mb-2">Project</label>
                <input
                  type="text"
                  value={filters.project}
                  onChange={(e) => setFilters({...filters, project: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-accent mb-2">Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({...filters, priority: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">All</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              
              <div>
                <label className="block text-accent mb-2">Due Date</label>
                <input
                  type="date"
                  value={filters.dueDate}
                  onChange={(e) => setFilters({...filters, dueDate: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>
            
            <div className="modal-action">
              <button
                type="button"
                className="px-4 py-2 bg-primary text-white rounded-lg"
                onClick={handleSearch}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </dialog>
      </form>
    </div>
  );
}