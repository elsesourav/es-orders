import { Bell, Database, Palette, Settings, Shield } from "lucide-react";

const SettingsPage = () => {
   const settingsGroups = [
      {
         title: "General",
         icon: Settings,
         settings: [
            {
               name: "Auto-sync orders",
               description: "Automatically sync orders every 15 minutes",
               enabled: true,
            },
            {
               name: "Email notifications",
               description: "Receive email alerts for new orders",
               enabled: false,
            },
            {
               name: "Dark mode",
               description: "Use dark theme for the interface",
               enabled: false,
            },
         ],
      },
      {
         title: "Notifications",
         icon: Bell,
         settings: [
            {
               name: "Push notifications",
               description: "Get browser push notifications",
               enabled: true,
            },
            {
               name: "Sound alerts",
               description: "Play sound for important notifications",
               enabled: true,
            },
            {
               name: "Weekly reports",
               description: "Receive weekly sales reports",
               enabled: false,
            },
         ],
      },
      {
         title: "Security",
         icon: Shield,
         settings: [
            {
               name: "Two-factor authentication",
               description: "Enable 2FA for enhanced security",
               enabled: false,
            },
            {
               name: "Session timeout",
               description: "Auto-logout after 30 minutes of inactivity",
               enabled: true,
            },
            {
               name: "Login alerts",
               description: "Get notified of new login attempts",
               enabled: true,
            },
         ],
      },
      {
         title: "Data & Privacy",
         icon: Database,
         settings: [
            {
               name: "Data backup",
               description: "Automatically backup your data daily",
               enabled: true,
            },
            {
               name: "Analytics tracking",
               description: "Allow usage analytics for improvements",
               enabled: false,
            },
            {
               name: "Data export",
               description: "Enable data export functionality",
               enabled: true,
            },
         ],
      },
   ];

   return (
      <div className="space-y-6">
         <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">
               Manage your application preferences and security settings
            </p>
         </div>

         <div className="space-y-6">
            {settingsGroups.map((group) => {
               const Icon = group.icon;
               return (
                  <div
                     key={group.title}
                     className="bg-white rounded-lg shadow-sm border border-gray-200"
                  >
                     <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                           <Icon size={24} className="text-primary-500" />
                           <h2 className="text-lg font-semibold text-gray-900">
                              {group.title}
                           </h2>
                        </div>
                     </div>
                     <div className="p-6 space-y-4">
                        {group.settings.map((setting, index) => (
                           <div
                              key={index}
                              className="flex items-center justify-between"
                           >
                              <div className="flex-1">
                                 <h3 className="text-sm font-medium text-gray-900">
                                    {setting.name}
                                 </h3>
                                 <p className="text-sm text-gray-500 mt-1">
                                    {setting.description}
                                 </p>
                              </div>
                              <div className="ml-4">
                                 <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                       type="checkbox"
                                       className="sr-only peer"
                                       defaultChecked={setting.enabled}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                 </label>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               );
            })}
         </div>

         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
               <Palette size={24} className="text-primary-500" />
               <h2 className="text-lg font-semibold text-gray-900">
                  Appearance
               </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <div className="relative">
                  <input
                     type="radio"
                     id="light"
                     name="theme"
                     className="sr-only peer"
                     defaultChecked
                  />
                  <label
                     htmlFor="light"
                     className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 peer-checked:border-primary-500 peer-checked:bg-primary-50"
                  >
                     <div className="w-16 h-12 bg-white border border-gray-300 rounded mb-2"></div>
                     <span className="text-sm font-medium">Light</span>
                  </label>
               </div>
               <div className="relative">
                  <input
                     type="radio"
                     id="dark"
                     name="theme"
                     className="sr-only peer"
                  />
                  <label
                     htmlFor="dark"
                     className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 peer-checked:border-primary-500 peer-checked:bg-primary-50"
                  >
                     <div className="w-16 h-12 bg-gray-800 border border-gray-600 rounded mb-2"></div>
                     <span className="text-sm font-medium">Dark</span>
                  </label>
               </div>
               <div className="relative">
                  <input
                     type="radio"
                     id="auto"
                     name="theme"
                     className="sr-only peer"
                  />
                  <label
                     htmlFor="auto"
                     className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 peer-checked:border-primary-500 peer-checked:bg-primary-50"
                  >
                     <div className="w-16 h-12 bg-gradient-to-r from-white to-gray-800 border border-gray-300 rounded mb-2"></div>
                     <span className="text-sm font-medium">Auto</span>
                  </label>
               </div>
            </div>
         </div>
      </div>
   );
};

export default SettingsPage;
