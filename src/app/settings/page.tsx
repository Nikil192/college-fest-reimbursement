import { Shield, HardDrive, Smartphone } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">System Settings</h1>
        <p className="text-gray-500">Configure administrative access, storage integrations, and messaging services.</p>
      </div>

      <div className="space-y-6">
        
        {/* wacli Configuration */}
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
              <Smartphone className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">WhatsApp CLI (wacli) Integration</h3>
              <p className="text-sm text-gray-500 mb-4">
                Payment notifications can be sent via <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono text-xs text-green-600">wacli</code> after a reimbursement is marked as paid.
              </p>
              
              <div className="space-y-3 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-lg border border-[var(--card-border)]">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Status</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Active / CLI Configured
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Command Driver</span>
                  <span className="font-mono text-xs">wacli send text --to ...</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Document storage */}
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
              <HardDrive className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">Local Document Storage</h3>
              <p className="text-sm text-gray-500 mb-4">
                Uploaded bills are stored directly on this server and served through the application.
              </p>
              
              <div className="space-y-3 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-lg border border-[var(--card-border)]">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Storage Directory</span>
                  <span className="font-mono text-xs text-blue-600">storage/documents</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Maximum File Size</span>
                  <span className="text-xs">10 MB</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Access */}
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
              <Shield className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">Role-Based Access Control (RBAC)</h3>
              <p className="text-sm text-gray-500 mb-4">
                Current active session operating with <strong className="text-gray-900 dark:text-gray-100">Super Administrator</strong> privileges.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
