import React, { useEffect, useState } from 'react';
import { organizationService } from '../../services';
import { ChecklistTemplate, Department } from '../../types';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface TemplateFormData {
  name: string;
  description: string;
  department_id: number | null;
  items: string[];
}

const TemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ChecklistTemplate | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    description: '',
    department_id: null,
    items: [''],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [templatesData, departmentsData] = await Promise.all([
        organizationService.getTemplates(),
        organizationService.getDepartments(),
      ]);
      setTemplates(templatesData);
      setDepartments(departmentsData);
    } catch (error) {
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (template?: ChecklistTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        description: template.description || '',
        department_id: template.department_id,
        items: template.items && template.items.length > 0 ? template.items : [''],
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        name: '',
        description: '',
        department_id: null,
        items: [''],
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTemplate(null);
    setFormData({
      name: '',
      description: '',
      department_id: null,
      items: [''],
    });
  };

  const handleAddItem = () => {
    setFormData({ ...formData, items: [...formData.items, ''] });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems.length > 0 ? newItems : [''] });
  };

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...formData.items];
    newItems[index] = value;
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter empty items
    const items = formData.items.filter((item) => item.trim() !== '');
    
    if (items.length === 0) {
      toast.error('Please add at least one checklist item');
      return;
    }

    try {
      if (editingTemplate) {
        await organizationService.updateTemplate(editingTemplate.id, {
          ...formData,
          items,
        });
        toast.success('Template updated successfully');
      } else {
        await organizationService.createTemplate({
          ...formData,
          items,
        });
        toast.success('Template created successfully');
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      toast.error('Failed to save template');
    }
  };

  const handleDelete = async (templateId: number) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    
    try {
      await organizationService.deleteTemplate(templateId);
      toast.success('Template deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete template');
    }
  };

  const handleDuplicate = (template: ChecklistTemplate) => {
    setEditingTemplate(null);
    setFormData({
      name: `${template.name} (Copy)`,
      description: template.description || '',
      department_id: template.department_id,
      items: template.items && template.items.length > 0 ? [...template.items] : [''],
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Checklist Templates</h1>
          <p className="text-gray-600">Manage checklist templates for separation cases</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          New Template
        </button>
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <ClipboardDocumentListIcon className="w-16 h-16 mx-auto text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No templates yet</h3>
            <p className="text-gray-500 mt-2">Create your first checklist template to get started.</p>
            <button
              onClick={() => handleOpenModal()}
              className="btn btn-primary mt-4"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Template
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="card hover:shadow-md transition-shadow">
              <div className="card-body">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                    {template.department && (
                      <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs mt-1">
                        {template.department.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDuplicate(template)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                      title="Duplicate"
                    >
                      <DocumentDuplicateIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleOpenModal(template)}
                      className="p-1.5 text-gray-400 hover:text-primary-600 rounded"
                      title="Edit"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                      title="Delete"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {template.description && (
                  <p className="text-sm text-gray-500 mb-3">{template.description}</p>
                )}

                <div className="border-t pt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Checklist Items ({(template.items || []).length})
                  </p>
                  <ul className="space-y-1">
                    {(template.items || []).slice(0, 3).map((item, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                        {item}
                      </li>
                    ))}
                    {(template.items || []).length > 3 && (
                      <li className="text-sm text-gray-400">
                        +{(template.items || []).length - 3} more items...
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-30" onClick={handleCloseModal}></div>
            
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <div className="px-6 py-4 border-b">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingTemplate ? 'Edit Template' : 'Create New Template'}
                  </h3>
                </div>

                <div className="px-6 py-4 space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input"
                      placeholder="e.g., IT Department Checklist"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input"
                      rows={2}
                      placeholder="Brief description of this template..."
                    />
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department (Optional)
                    </label>
                    <select
                      value={formData.department_id || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        department_id: e.target.value ? parseInt(e.target.value) : null 
                      })}
                      className="input"
                    >
                      <option value="">All Departments</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty to make this template available for all departments
                    </p>
                  </div>

                  {/* Checklist Items */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Checklist Items *
                    </label>
                    <div className="space-y-2">
                      {formData.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 w-6">{index + 1}.</span>
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleItemChange(index, e.target.value)}
                            className="input flex-1"
                            placeholder="Enter checklist item..."
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="p-2 text-gray-400 hover:text-red-600"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="mt-2 text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                    >
                      <PlusIcon className="w-4 h-4" />
                      Add Item
                    </button>
                  </div>
                </div>

                <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingTemplate ? 'Update Template' : 'Create Template'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesPage;
