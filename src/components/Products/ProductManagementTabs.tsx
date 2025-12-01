import { useState } from 'react';
import { Package, Tag, Layers } from 'lucide-react';
import ProductManagement from './ProductManagement';
import BrandManagement from '../Brands/BrandManagement';
import CategoryManagement from '../Categories/CategoryManagement';

export default function ProductManagementTabs() {
  const [activeTab, setActiveTab] = useState<'products' | 'brands' | 'categories'>('products');

  const tabs = [
    { id: 'products', label: 'Sản phẩm', icon: Package },
    { id: 'brands', label: 'Hãng', icon: Layers },
    { id: 'categories', label: 'Loại sản phẩm', icon: Tag },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2">
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon size={20} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'products' && <ProductManagement />}
        {activeTab === 'brands' && <BrandManagement />}
        {activeTab === 'categories' && <CategoryManagement />}
      </div>
    </div>
  );
}
