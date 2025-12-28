'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import { Card } from '@/components/ui/card';

interface Stats {
  totalUsers: number;
  buyers: number;
  sellers: number;
  admins: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get('/admin/stats');
        if (response.data.status && response.data.data) {
          setStats(response.data.data.stats);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {stats?.totalUsers || 0}
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Buyers</h3>
          <p className="mt-2 text-3xl font-semibold text-blue-600">
            {stats?.buyers || 0}
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Sellers</h3>
          <p className="mt-2 text-3xl font-semibold text-green-600">
            {stats?.sellers || 0}
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Admins</h3>
          <p className="mt-2 text-3xl font-semibold text-purple-600">
            {stats?.admins || 0}
          </p>
        </Card>
      </div>

      <div className="mt-8">
        <Card className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Recent Activity
          </h2>
          <p className="text-gray-500">No recent activity to display</p>
        </Card>
      </div>
    </div>
  );
}
