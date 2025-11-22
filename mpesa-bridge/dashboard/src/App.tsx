import { motion } from 'framer-motion';
import { LayoutDashboard, Wallet, Activity } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-background text-white p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <header className="mb-12 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              M-Pesa Bridge
            </h1>
            <p className="text-slate-400 mt-2">Enterprise Payment Gateway Dashboard</p>
          </div>
          <div className="glass px-4 py-2 rounded-full flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium">System Operational</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { title: 'Total Volume', value: 'KES 1,240,500', icon: Wallet, color: 'text-primary' },
            { title: 'Active Projects', value: '12', icon: LayoutDashboard, color: 'text-secondary' },
            { title: 'Success Rate', value: '99.9%', icon: Activity, color: 'text-green-500' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass p-6 rounded-2xl glass-hover cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded-full">+12% this week</span>
              </div>
              <h3 className="text-slate-400 text-sm font-medium">{stat.title}</h3>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="glass rounded-3xl p-8">
          <h2 className="text-xl font-bold mb-6">Recent Transactions</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    MP
                  </div>
                  <div>
                    <p className="font-medium">Payment from 254712***78</p>
                    <p className="text-xs text-slate-500">Just now</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">+ KES 1,500.00</p>
                  <p className="text-xs text-green-500">Completed</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default App;
