import { useState } from 'react';
import { ShoppingCart, CreditCard, Package } from 'lucide-react';
import OrderManagement from '../Orders/OrderManagement';
import POSView from './POSView.tsx';
import PendingOrders from './PendingOrders.tsx';

export default function SalesManagementTabs() {
  const [activeTab, setActiveTab] = useState('pos');

  const tabs = [
    { id: 'pos', name: 'Bán hàng tại quầy', icon: CreditCard },
    { id: 'orders', name: 'Quản lý đơn hàng', icon: ShoppingCart },
    { id: 'pending', name: 'Hàng tồn', icon: Package },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="border-b border-slate-200">
          <nav className="flex gap-2 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={20} />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'pos' && <POSView />}
          {activeTab === 'orders' && <OrderManagement />}
          {activeTab === 'pending' && <PendingOrders />}
        </div>
      </div>
    </div>
  );
}
