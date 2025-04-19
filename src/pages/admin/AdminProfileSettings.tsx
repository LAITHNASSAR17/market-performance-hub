
import React from 'react';
import Layout from '@/components/Layout';
import { UserInformationCard } from '@/components/admin/profile/UserInformationCard';
import { PreferencesCard } from '@/components/admin/profile/PreferencesCard';

const AdminProfileSettings: React.FC = () => {
  return (
    <Layout>
      <div className="container max-w-4xl py-10">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">
          Admin Profile Settings
        </h1>
        <UserInformationCard />
        <PreferencesCard />
      </div>
    </Layout>
  );
};

export default AdminProfileSettings;
