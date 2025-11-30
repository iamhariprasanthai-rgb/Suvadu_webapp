import React, { useEffect, useState } from 'react';
import { organizationService } from '../../services';
import { OrgTreeNode } from '../../types';
import {
  UserCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const TeamViewPage: React.FC = () => {
  const [tree, setTree] = useState<OrgTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchTree();
  }, []);

  const fetchTree = async () => {
    setLoading(true);
    try {
      const data = await organizationService.getOrgTree();
      setTree(data);
      // Expand first level by default
      const firstLevelIds = new Set(data.map((node) => node.user.id));
      setExpandedNodes(firstLevelIds);
    } catch (error) {
      console.error('Failed to fetch org tree');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (userId: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedNodes(newExpanded);
  };

  const getRoleBadge = (role: string) => {
    const roleLabels: Record<string, { label: string; color: string }> = {
      employee: { label: 'Employee', color: 'bg-gray-100 text-gray-700' },
      direct_manager: { label: 'Manager', color: 'bg-blue-100 text-blue-700' },
      department_manager: { label: 'Dept. Manager', color: 'bg-purple-100 text-purple-700' },
      separation_manager: { label: 'HR Admin', color: 'bg-green-100 text-green-700' },
    };
    const { label, color } = roleLabels[role] || { label: role, color: 'bg-gray-100 text-gray-700' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{label}</span>;
  };

  const renderNode = (node: OrgTreeNode, level: number = 0) => {
    const hasReports = node.reports && node.reports.length > 0;
    const isExpanded = expandedNodes.has(node.user.id);

    return (
      <div key={node.user.id} className={`${level > 0 ? 'ml-8' : ''}`}>
        <div
          className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors ${
            level === 0 ? 'bg-gray-50' : ''
          }`}
        >
          {/* Expand/Collapse button */}
          <button
            onClick={() => toggleExpand(node.user.id)}
            className={`p-1 rounded ${hasReports ? 'hover:bg-gray-200' : 'invisible'}`}
          >
            {hasReports && (isExpanded ? (
              <ChevronDownIcon className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRightIcon className="w-4 h-4 text-gray-500" />
            ))}
          </button>

          {/* Avatar */}
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-primary-700 font-medium">
              {node.user.first_name?.charAt(0)}
              {node.user.last_name?.charAt(0)}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900">{node.user.full_name}</p>
              {getRoleBadge(node.user.role)}
            </div>
            <p className="text-sm text-gray-500">{node.user.email}</p>
          </div>

          {/* Department */}
          {node.user.department && (
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">{node.user.department.name}</p>
            </div>
          )}

          {/* Reports count */}
          {hasReports && (
            <span className="text-sm text-gray-500">
              {node.reports.length} report{node.reports.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Children */}
        {hasReports && isExpanded && (
          <div className="border-l-2 border-gray-200 ml-5 mt-1">
            {node.reports.map((childNode) => renderNode(childNode, level + 1))}
          </div>
        )}
      </div>
    );
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Team View</h1>
        <p className="text-gray-600">View your organizational hierarchy</p>
      </div>

      {/* Org Tree */}
      <div className="card">
        <div className="card-body">
          {tree.length === 0 ? (
            <div className="text-center py-12">
              <UserCircleIcon className="w-16 h-16 mx-auto text-gray-300" />
              <p className="text-gray-500 mt-4">No team members found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tree.map((node) => renderNode(node))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamViewPage;
