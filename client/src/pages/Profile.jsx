import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  Save, 
  Upload, 
  MapPin, 
  Phone, 
  Building2, 
  Hash, 
  Check,
  Loader2,
  Cpu
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../utils/toastUtils';
import { setUser } from '../redux/userSlice';
import userLogo from '../assets/user.png'
import { apiClient } from '@/services/apiClients';

export default function Profile() {
  const params = useParams();
  const userId = params?.userId;
  const { user } = useSelector(store => store.user);
  
  // User Data State
  const [userData, setUserData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    addressInfo: {
      street: user?.addressInfo?.street || '',
      city: user?.addressInfo?.city || '',
      state: user?.addressInfo?.state || '',
      zipCode: user?.addressInfo?.zipCode || '',
    },
    phoneNo: user?.phoneNo || '',
    role: user?.role || '',
    profilePic: user?.profilePic || ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const dispatch = useDispatch();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      addressInfo: { ...prev.addressInfo, [name]: value }
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setUserData(prev => ({ ...prev, profilePic: URL.createObjectURL(selectedFile) })); // preview only
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    const accessToken = localStorage.getItem("accessToken");

    try {
      const formData = new FormData();
      formData.append("firstName", userData.firstName) 
      formData.append("lastName", userData.lastName)
      formData.append("email", userData.email)
      formData.append("address", userData.addressInfo.street)
      formData.append("city", userData.addressInfo.city)
      formData.append("state", userData.addressInfo.state)
      formData.append("zipCode", userData.addressInfo.zipCode)
      formData.append("phoneNo", userData.phoneNo)
      formData.append("role", userData.role)

      if (file) {
        formData.append("file", file)
      }

      const res = await apiClient.put(`/api/v1/user/update/${userId}`, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data"
        }
      })

      if (res.data.success) {
        useToast.success(res.data.message)
        dispatch(setUser(res.data.user))
        setIsEditing(false); // Close edit mode on success
      }

    } catch (error) {
      console.log(error);
      useToast.error("Failed to Update Profile")
    } finally {
      setLoading(false);
    }
  };

  // Helper function for input class names to keep JSX clean
  const getInputClass = (isEditing) => 
    `w-full text-xs p-3 mt-1 rounded-lg transition-all shadow-sm ${
      isEditing 
        ? 'bg-background border border-border text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary' 
        : 'bg-muted border border-border/50 text-muted-foreground cursor-not-allowed'
    }`;

  // Helper for input with icons
  const getIconInputClass = (isEditing) => 
    `w-full text-xs p-3 pl-10 rounded-lg transition-all shadow-sm ${
      isEditing 
        ? 'bg-background border border-border text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary' 
        : 'bg-muted border border-border/50 text-muted-foreground cursor-not-allowed'
    }`;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-6 md:p-12 max-w-5xl mx-auto w-full select-none transition-colors duration-300">
      
      {/* Page Header */}
      <div className="pb-8 border-b border-border flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
            <Cpu className="w-6 h-6 text-primary" /> User Profile
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Manage your CoreFlow analytical workspace settings and preferences.</p>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-secondary border border-border rounded-lg text-xs font-bold text-secondary-foreground hover:border-primary transition-colors cursor-pointer shadow-sm"
        >
          {isEditing ? 'View Profile' : 'Edit Profile'}
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8 py-10 items-start">
        
        {/* Left Column - Profile Card */}
        <div className="md:col-span-1 bg-card border border-border rounded-xl p-6 text-center relative shadow-2xl shadow-black/5 dark:shadow-black/40">
          <div className="relative w-20 h-20 bg-gradient-to-tr from-core-cyan to-core-purple rounded-full flex items-center justify-center text-white font-black text-2xl mx-auto mb-4 shadow-xl shadow-primary/20">
            {userData.profilePic ? (
              <img 
                src={userData.profilePic} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover" 
              />
            ) : (
              <span>
                {userData.firstName ? userData.firstName[0].toUpperCase() : 'A'}
              </span>
            )}

            {isEditing && (
              <>
                <label 
                  htmlFor="profilePicUpload" 
                  className="absolute bottom-0 right-0 p-1.5 bg-card border border-border rounded-full text-primary cursor-pointer hover:text-foreground transition-colors shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                </label>
                <input 
                  type="file" 
                  id="profilePicUpload" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
              </>
            )}
          </div>
          
          <h3 className="font-bold text-sm text-foreground">
            {userData.firstName} {userData.lastName}
          </h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">{userData.email}</p>
          
          <span className="text-[10px] font-mono text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-md mt-4 inline-flex items-center gap-1.5">
            <Shield className="w-3 h-3" /> Standard Workspace
          </span>

          {/* Quick Stats/Activity Panel */}
          <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-border text-left">
            <div className="bg-background p-3 rounded-lg border border-border shadow-sm">
              <p className="text-[10px] uppercase text-muted-foreground font-mono font-medium">Processes</p>
              <p className="text-sm font-black text-foreground mt-1">12/32</p>
            </div>
            <div className="bg-background p-3 rounded-lg border border-border shadow-sm">
              <p className="text-[10px] uppercase text-muted-foreground font-mono font-medium">Uptime</p>
              <p className="text-sm font-black text-foreground mt-1">98.4%</p>
            </div>
          </div>
        </div>

        {/* Right Column - Profile Management Form */}
        <div className="md:col-span-2 bg-card border border-border rounded-xl p-6 shadow-2xl shadow-black/5 dark:shadow-black/40">
          <form onSubmit={handleSave} className="space-y-6">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">First Name</label>
                <input 
                  type="text"
                  name="firstName"
                  value={userData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={getInputClass(isEditing)}
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Last Name</label>
                <input 
                  type="text"
                  name="lastName"
                  value={userData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Sharma"
                  className={getInputClass(isEditing)}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Email Address</label>
              <div className="relative mt-1">
                <input 
                  type="email"
                  name="email"
                  value={userData.email}
                  disabled
                  className="w-full text-xs p-3 pl-10 bg-muted border border-border/50 rounded-lg text-muted-foreground cursor-not-allowed shadow-sm"
                />
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Phone Number</label>
              <div className="relative mt-1">
                <input 
                  type="text"
                  name="phoneNo"
                  value={userData.phoneNo}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="+91 98765 43210"
                  className={getIconInputClass(isEditing)}
                />
                <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5" />
              </div>
            </div>

            {/* Address Information Segment */}
            <div className="border-t border-border pt-6">
              <h4 className="text-xs font-bold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> Diagnostic Unit Address Info
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Street</label>
                  <input 
                    type="text"
                    name="street"
                    value={userData.addressInfo.street}
                    onChange={handleAddressChange}
                    disabled={!isEditing}
                    placeholder="12th Main Road, Sector 3"
                    className={getInputClass(isEditing)}
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">City</label>
                  <input 
                    type="text"
                    name="city"
                    value={userData.addressInfo.city}
                    onChange={handleAddressChange}
                    disabled={!isEditing}
                    placeholder="Ajmer"
                    className={getInputClass(isEditing)}
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">State</label>
                  <input 
                    type="text"
                    name="state"
                    value={userData.addressInfo.state}
                    onChange={handleAddressChange}
                    disabled={!isEditing}
                    placeholder="Rajasthan"
                    className={getInputClass(isEditing)}
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Zip Code</label>
                  <input 
                    type="text"
                    name="zipCode"
                    value={userData.addressInfo.zipCode}
                    onChange={handleAddressChange}
                    disabled={!isEditing}
                    placeholder="305001"
                    className={getInputClass(isEditing)}
                  />
                </div>
              </div>
            </div>

            {/* Save Buttons */}
            {isEditing && (
              <div className="pt-6 border-t border-border flex justify-end gap-3 animate-in fade-in duration-300">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 bg-secondary border border-border text-xs font-bold text-secondary-foreground rounded-lg hover:border-destructive hover:text-destructive transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-6 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Saved Simulations section */}
      <div className="border-t border-border pt-10 pb-12">
        <h3 className="text-sm font-black text-foreground mb-6 flex items-center gap-2">
          <Save className="w-4 h-4 text-primary" /> Recent Simulation Scenarios
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors shadow-lg shadow-black/5 dark:shadow-black/40 cursor-pointer group">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-algo-rr/10 text-algo-rr border border-algo-rr/20">RR Mode</span>
                <h4 className="text-xs font-bold text-foreground mt-3 group-hover:text-primary transition-colors">Simulation Run #9021</h4>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-3">Processes: 16 | Quantum: 4ms | Run-time: 21.2s</p>
          </div>
          
          {/* Card 2 */}
          <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors shadow-lg shadow-black/5 dark:shadow-black/40 cursor-pointer group">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-algo-sjf/10 text-algo-sjf border border-algo-sjf/20">SJF Mode</span>
                <h4 className="text-xs font-bold text-foreground mt-3 group-hover:text-primary transition-colors">Simulation Run #8994</h4>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-3">Processes: 12 | Algorithmic Variant: Active</p>
          </div>
          
          {/* Card 3 */}
          <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors shadow-lg shadow-black/5 dark:shadow-black/40 cursor-pointer group">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-algo-fcfs/10 text-algo-fcfs border border-algo-fcfs/20">FCFS Mode</span>
                <h4 className="text-xs font-bold text-foreground mt-3 group-hover:text-primary transition-colors">Simulation Run #8872</h4>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-3">Processes: 20 | Run-time: 44.1s</p>
          </div>
        </div>
      </div>
    </div>
  );
}