import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Sparkles, 
  Building2, 
  Briefcase, 
  Globe, 
  Smartphone, 
  Link as LinkIcon, 
  Palette, 
  CheckCircle2, 
  Save,
  LayoutDashboard,
  Megaphone,
  Users,
  Settings,
  ChevronRight,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Music2,
  Image as ImageIcon,
  X,
  Loader2,
  Copy,
  Check,
  Send,
  Video,
  MessageSquare,
  Hash,
  Type as TypeIcon,
  Zap,
  RefreshCw
} from "lucide-react";

const INDUSTRIES = [
  "Restaurant", "Café", "Barber Shop", "Beauty Salon", 
  "Wellness Studio", "Retail Store", "Hotel & Hospitality", "Other"
];

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: Instagram },
  { id: 'facebook', label: 'Facebook', icon: Facebook },
  { id: 'tiktok', label: 'TikTok', icon: Music2 },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { id: 'youtube', label: 'YouTube', icon: Youtube }
];

const TONES = [
  "Professional", "Casual & Fun", "Luxury & Premium", "Bold & Direct", "Warm & Friendly"
];

const COUNTRIES = [
  "South Africa", "United Kingdom", "United States", "Australia", "Nigeria", "Kenya", "Other"
];

const GOALS = [
  "Get Bookings", "Drive Foot Traffic", "Build Following", "Promote Offer", "Brand Awareness"
];

const NUM_POSTS_OPTIONS = [3, 5, 10];

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'campaigns'

  // Brand Profile State
  const [profile, setProfile] = useState({
    businessName: '',
    industry: 'Restaurant',
    platforms: ['instagram'],
    tone: 'Professional',
    country: 'South Africa',
    whatsapp: '',
    website: '',
    brandColor: '#4F46E5'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showSavedTick, setShowSavedTick] = useState(false);

  // Generator State
  const [topic, setTopic] = useState('');
  const [numPosts, setNumPosts] = useState(5);
  const [goal, setGoal] = useState('Get Bookings');
  const [loading, setLoading] = useState(false);
  const [campaign, setCampaign] = useState(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [copyStates, setCopyStates] = useState({});

  const [error, setError] = useState(null);

  const handleProfileChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const togglePlatform = (platformId) => {
    setProfile(prev => {
      const platforms = prev.platforms.includes(platformId)
        ? prev.platforms.filter(p => p !== platformId)
        : [...prev.platforms, platformId];
      return { ...prev, platforms };
    });
  };

  const saveProfile = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSavedTick(true);
      setTimeout(() => setShowSavedTick(false), 2000);
    }, 800);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopyStates(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopyStates(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const generateCampaign = async () => {
    if (!topic || !profile.businessName) return;
    setLoading(true);
    setCampaign(null);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      
      const systemInstruction = `You are an elite social media marketing strategist with 30 years of experience in hospitality, retail, food & beverage, and beauty industries across global markets. You understand what makes customers book, buy, and return — not just scroll.

You are generating a high-converting social media campaign for:
Business: ${profile.businessName}
Industry: ${profile.industry}  
Target Platforms: ${profile.platforms.join(', ')}
Brand Tone: ${profile.tone}
Market: ${profile.country}
Campaign Goal: ${goal}
Topic: ${topic}

CONTENT STRATEGY MIX:
- 60% visual/viral content (food, transformation, satisfying clips)
- 30% business pain point content (empty store, bad marketing, missed sales)
- 10% authority/positioning content

RULES:
- Every post must have a scroll-stopping hook in the first line
- Every caption must have a clear CTA
- Content must feel native to ${profile.platforms.join(', ')} — not generic
- Tone must match: ${profile.tone}
- Write for real business owners, not marketers
- At least 20% of posts must include urgency
- Hashtags must be market-relevant for ${profile.country}

Generate ${numPosts} posts following the exact output format provided.`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          posts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                hook: { type: Type.STRING },
                onScreenText: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      scene: { type: Type.STRING },
                      text: { type: Type.STRING }
                    }
                  }
                },
                caption: { type: Type.STRING },
                hashtags: { type: Type.STRING },
                templateType: { type: Type.STRING }
              },
              required: ["hook", "onScreenText", "caption", "hashtags", "templateType"]
            }
          },
          batchAssets: {
            type: Type.OBJECT,
            properties: {
              whatsappMessage: { type: Type.STRING },
              dmScript: { type: Type.STRING },
              commentStrategy: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              videoShootInstructions: { type: Type.STRING },
              aiPresenterScript: { type: Type.STRING }
            },
            required: ["whatsappMessage", "dmScript", "commentStrategy", "videoShootInstructions", "aiPresenterScript"]
          }
        },
        required: ["posts", "batchAssets"]
      };

      let contents;
      if (imagePreview) {
        const base64Data = imagePreview.split(',')[1];
        contents = {
          parts: [
            { text: systemInstruction },
            {
              inlineData: {
                data: base64Data,
                mimeType: image.type
              }
            }
          ]
        };
      } else {
        contents = { parts: [{ text: systemInstruction }] };
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema
        }
      });

      const data = JSON.parse(response.text);
      setCampaign(data);
    } catch (err) {
      console.error("Generation error:", err);
      setError("We encountered a small hiccup while crafting your campaign. Please ensure your API key is active and try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetCampaign = () => {
    setCampaign(null);
    setTopic('');
    setImage(null);
    setImagePreview(null);
    setError(null);
  };

  const copyAllPosts = () => {
    if (!campaign) return;
    const allText = campaign.posts.map((post, index) => {
      const scenes = post.onScreenText.map(s => `${s.scene}: ${s.text}`).join('\n');
      return `POST ${index + 1} (${post.templateType})\nHOOK: ${post.hook}\n\nON-SCREEN:\n${scenes}\n\nCAPTION:\n${post.caption}\n\nHASHTAGS:\n${post.hashtags}\n\n-------------------\n`;
    }).join('\n');
    
    navigator.clipboard.writeText(allText);
    setCopyStates(prev => ({ ...prev, all: true }));
    setTimeout(() => setCopyStates(prev => ({ ...prev, all: false })), 2000);
  };

  const getTemplateColor = (type) => {
    switch(type) {
      case 'A': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'B': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'C': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTemplateLabel = (type) => {
    switch(type) {
      case 'A': return 'Soft Sell';
      case 'B': return 'Direct Sell';
      case 'C': return 'Authority';
      default: return 'Standard';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Premium Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
                <Sparkles className="w-5 h-5 text-white fill-current" />
              </div>
              <h1 className="text-2xl font-black tracking-tighter text-slate-900">
                Content<span className="text-indigo-600">Flow</span>
              </h1>
            </div>
            <p className="text-[10px] sm:text-xs font-medium text-slate-500 mt-0.5 tracking-wide uppercase">
              AI-Powered Social Marketing. Built for Real Businesses.
            </p>
          </div>
          
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Powered by Gemini AI</span>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto">
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-64 p-6 flex flex-col gap-4 lg:sticky lg:top-20 lg:h-[calc(100vh-80px)]">
          <nav className="flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-white hover:text-slate-900'
              }`}
            >
              <Building2 className="w-5 h-5" />
              Brand Profile
            </button>
            <button 
              onClick={() => setActiveTab('campaigns')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'campaigns' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-white hover:text-slate-900'
              }`}
            >
              <Megaphone className="w-5 h-5" />
              Campaigns
            </button>
            <div className="h-px bg-slate-200 my-2 mx-4" />
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 font-bold transition-all opacity-50 cursor-not-allowed">
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </button>
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 font-bold transition-all opacity-50 cursor-not-allowed">
              <Users className="w-5 h-5" />
              Audience
            </button>
          </nav>

          <div className="mt-auto p-5 bg-slate-900 rounded-2xl text-white space-y-3 hidden lg:block">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Pro Plan</p>
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            </div>
            <p className="text-sm font-bold">Unlimited AI Credits</p>
            <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs font-bold transition-all active:scale-95">
              Manage Subscription
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 lg:p-12 w-full overflow-hidden">
        {activeTab === 'profile' ? (
          <>
            <header className="mb-10">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Brand Profile</h1>
              <p className="text-slate-500">Define your business identity to generate perfectly tailored content.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column: Core Info */}
              <div className="md:col-span-2 space-y-6">
                <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-8">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-500" />
                      Business Name
                    </label>
                    <input 
                      type="text"
                      value={profile.businessName}
                      onChange={(e) => handleProfileChange('businessName', e.target.value)}
                      placeholder="e.g. The Golden Grill"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-indigo-500" />
                        Industry
                      </label>
                      <select 
                        value={profile.industry}
                        onChange={(e) => handleProfileChange('industry', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 bg-white"
                      >
                        {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-indigo-500" />
                        Country / Market
                      </label>
                      <select 
                        value={profile.country}
                        onChange={(e) => handleProfileChange('country', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 bg-white"
                      >
                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700">Target Platforms</label>
                    <div className="flex flex-wrap gap-2">
                      {PLATFORMS.map(({ id, label, icon: Icon }) => (
                        <button
                          key={id}
                          onClick={() => togglePlatform(id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-sm font-medium ${
                            profile.platforms.includes(id)
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700">Brand Tone</label>
                    <div className="flex flex-wrap gap-2">
                      {TONES.map(tone => (
                        <button
                          key={tone}
                          onClick={() => handleProfileChange('tone', tone)}
                          className={`px-4 py-2 rounded-full border transition-all text-sm font-medium ${
                            profile.tone === tone
                              ? 'bg-orange-500 border-orange-500 text-white shadow-md'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-orange-300'
                          }`}
                        >
                          {tone}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column: Contact & Style */}
              <div className="space-y-6">
                <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-indigo-500" />
                    Contact Details
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">WhatsApp Number</label>
                      <input 
                        type="text"
                        value={profile.whatsapp}
                        onChange={(e) => handleProfileChange('whatsapp', e.target.value)}
                        placeholder="+27 00 000 0000"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Website URL</label>
                      <input 
                        type="text"
                        value={profile.website}
                        onChange={(e) => handleProfileChange('website', e.target.value)}
                        placeholder="www.yourbusiness.com"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                      />
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-indigo-500" />
                    Visual Identity
                  </h3>
                  <div className="flex items-center gap-4">
                    <input 
                      type="color"
                      value={profile.brandColor}
                      onChange={(e) => handleProfileChange('brandColor', e.target.value)}
                      className="w-12 h-12 rounded-lg cursor-pointer border-none p-0 overflow-hidden"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-700">Brand Primary Color</p>
                      <p className="text-xs text-slate-500 uppercase">{profile.brandColor}</p>
                    </div>
                  </div>
                </section>

                <button
                  onClick={saveProfile}
                  disabled={isSaving || !profile.businessName}
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg ${
                    showSavedTick 
                      ? 'bg-green-500 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {isSaving ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : showSavedTick ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 animate-scale-in" />
                      Profile Saved
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Brand Profile
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <header className="mb-10">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Campaign Generator</h1>
              <p className="text-slate-500">Create a full viral campaign in seconds using your brand profile.</p>
            </header>

            {!profile.businessName && (
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl mb-8 flex items-start gap-3">
                <Zap className="w-5 h-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="text-orange-800 font-bold text-sm">Brand Profile Incomplete</p>
                  <p className="text-orange-700 text-xs">Please set your business name in the <button onClick={() => setActiveTab('profile')} className="underline font-bold">Brand Profile</button> tab before generating content.</p>
                </div>
              </div>
            )}

            {/* Input Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-8 mb-12">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  What's the campaign topic or goal?
                </label>
                <textarea 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. New menu launch, Weekend specials, Why customers choose us, Before & after transformation..."
                  className="w-full h-32 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700">Number of Posts</label>
                  <div className="flex gap-2">
                    {NUM_POSTS_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        onClick={() => setNumPosts(opt)}
                        className={`flex-1 py-2 rounded-lg border font-bold text-sm transition-all ${
                          numPosts === opt 
                            ? 'bg-indigo-600 border-indigo-600 text-white' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                        }`}
                      >
                        {opt} Posts
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700">Content Goal</label>
                  <div className="flex flex-wrap gap-2">
                    {GOALS.map(g => (
                      <button
                        key={g}
                        onClick={() => setGoal(g)}
                        className={`px-3 py-2 rounded-lg border font-bold text-xs transition-all ${
                          goal === g
                            ? 'bg-orange-500 border-orange-500 text-white'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-orange-300'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-indigo-500" />
                  Reference Image (Optional)
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:border-indigo-500 hover:text-indigo-600 transition-all flex items-center gap-2"
                  >
                    <ImageIcon className="w-5 h-5" />
                    Upload Image
                  </button>
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  {imagePreview && (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-sm animate-scale-in">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={removeImage}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={generateCampaign}
                disabled={loading || !topic || !profile.businessName}
                className="w-full py-5 rounded-2xl font-black text-lg text-white shadow-xl transition-all flex items-center justify-center gap-4 bg-gradient-to-r from-indigo-600 to-orange-500 hover:from-indigo-700 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-7 h-7 animate-spin" />
                    Generating Your Campaign...
                  </>
                ) : (
                  <>
                    Generate Campaign
                    <Zap className="w-6 h-6 fill-current" />
                  </>
                )}
              </button>
            </div>

            {/* Error Card */}
            {error && (
              <div className="bg-red-50 border border-red-200 p-6 rounded-2xl mb-8 flex items-start gap-4 animate-scale-in">
                <div className="p-2 bg-red-100 rounded-lg">
                  <X className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-red-900 font-bold text-lg mb-1">Oops! Something went wrong</h3>
                  <p className="text-red-700 text-sm leading-relaxed">{error}</p>
                  <button 
                    onClick={generateCampaign}
                    className="mt-4 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center space-y-6 mb-12 animate-pulse">
                <div className="relative">
                  <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center animate-bounce">
                    <Sparkles className="w-10 h-10 text-indigo-600 fill-current" />
                  </div>
                  <div className="absolute inset-0 w-20 h-20 bg-indigo-400 rounded-full animate-ping opacity-20" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-black text-slate-900">Crafting Your Viral Campaign...</h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto">Our AI strategist is analyzing your brand and market trends to build high-converting content.</p>
                </div>
              </div>
            )}

            {/* Results Section */}
            {campaign ? (
              <div className="space-y-12 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Your Campaign is Ready</h2>
                    <p className="text-slate-500 text-sm">We've generated {campaign.posts.length} high-converting posts for your business.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={copyAllPosts}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
                    >
                      {copyStates.all ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copyStates.all ? 'Copied All!' : 'Copy All Posts'}
                    </button>
                    <button 
                      onClick={resetCampaign}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all active:scale-95"
                    >
                      <RefreshCw className="w-4 h-4" />
                      New Campaign
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {campaign.posts.map((post, index) => (
                    <div key={index} className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col h-full group hover:border-indigo-200 transition-all duration-300">
                      <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-full tracking-widest uppercase">
                            POST {index + 1}
                          </span>
                          <span className={`px-3 py-1 border text-[10px] font-black rounded-full tracking-widest uppercase ${getTemplateColor(post.templateType)}`}>
                            TYPE {post.templateType} • {getTemplateLabel(post.templateType)}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {profile.platforms.map(p => {
                            const PlatformIcon = PLATFORMS.find(pl => pl.id === p)?.icon || Globe;
                            return (
                              <span key={p} className="w-6 h-6 bg-white border border-slate-200 rounded-md flex items-center justify-center text-slate-400" title={p}>
                                <PlatformIcon className="w-4 h-4" />
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <div className="p-8 space-y-8 flex-grow">
                        {/* Hook Section */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                              <Zap className="w-3 h-3 fill-current" /> The Hook
                            </label>
                            <button 
                              onClick={() => copyToClipboard(post.hook, `hook-${index}`)}
                              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-indigo-600"
                            >
                              {copyStates[`hook-${index}`] ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                          <p className="text-lg font-bold text-slate-900 leading-tight italic">"{post.hook}"</p>
                        </div>

                        {/* On-Screen Text */}
                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Video className="w-3 h-3" /> Visual Flow (On-Screen Text)
                          </label>
                          <div className="grid grid-cols-1 gap-3">
                            {post.onScreenText.map((step, sIdx) => (
                              <div key={sIdx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-black text-indigo-500 uppercase mb-1">{step.scene}</p>
                                <p className="text-sm font-medium text-slate-700">{step.text}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Caption Section */}
                        <div className="space-y-3 pt-4 border-t border-slate-50">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Caption & Hashtags</label>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => copyToClipboard(post.caption, `cap-${index}`)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-indigo-600 hover:text-white rounded-lg text-[10px] font-bold text-slate-600 transition-all"
                              >
                                {copyStates[`cap-${index}`] ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                {copyStates[`cap-${index}`] ? 'Copied' : 'Copy Caption'}
                              </button>
                              <button 
                                onClick={() => copyToClipboard(post.hashtags, `hash-${index}`)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-indigo-600 hover:text-white rounded-lg text-[10px] font-bold text-slate-600 transition-all"
                              >
                                {copyStates[`hash-${index}`] ? <Check className="w-3 h-3" /> : <Hash className="w-3 h-3" />}
                                {copyStates[`hash-${index}`] ? 'Copied' : 'Copy Hashtags'}
                              </button>
                            </div>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-2xl">
                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap mb-4">{post.caption}</p>
                            <p className="text-xs text-indigo-500 font-medium italic">{post.hashtags}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Batch Assets */}
                <div className="space-y-6 pt-12 border-t border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <LayoutDashboard className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900">Campaign Batch Assets</h3>
                      <p className="text-slate-500 text-sm">Outreach scripts and filming guides for your team.</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-indigo-600" /> WhatsApp Outreach
                        </h4>
                        <button onClick={() => copyToClipboard(campaign.batchAssets.whatsappMessage, 'wa')} className="text-slate-400 hover:text-indigo-600">
                          {copyStates.wa ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl italic">"{campaign.batchAssets.whatsappMessage}"</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                          <Send className="w-4 h-4 text-indigo-600" /> DM Script (IG/FB)
                        </h4>
                        <button onClick={() => copyToClipboard(campaign.batchAssets.dmScript, 'dm')} className="text-slate-400 hover:text-indigo-600">
                          {copyStates.dm ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl italic">"{campaign.batchAssets.dmScript}"</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Video className="w-4 h-4 text-indigo-600" /> Shooting Instructions
                      </h4>
                      <p className="text-sm text-slate-600 leading-relaxed">{campaign.batchAssets.videoShootInstructions}</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                          <Users className="w-4 h-4 text-indigo-600" /> AI Presenter Script
                        </h4>
                        <button onClick={() => copyToClipboard(campaign.batchAssets.aiPresenterScript, 'ai')} className="text-slate-400 hover:text-indigo-600">
                          {copyStates.ai ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl leading-relaxed">{campaign.batchAssets.aiPresenterScript}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : !loading && !error && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-16 flex flex-col items-center justify-center text-center space-y-6 animate-scale-in">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                  <Megaphone className="w-10 h-10 text-slate-300" />
                </div>
                <div className="max-w-md space-y-2">
                  <h3 className="text-2xl font-black text-slate-900">Ready to go viral?</h3>
                  <p className="text-slate-500">Fill out the campaign details above and click generate to see your high-converting marketing content appear here.</p>
                </div>
                <div className="flex gap-4 pt-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <Check className="w-4 h-4 text-emerald-500" /> Multi-Post Campaigns
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <Check className="w-4 h-4 text-emerald-500" /> Batch Assets
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <footer className="mt-20 py-12 border-t border-slate-200">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600 fill-current" />
              <span className="text-lg font-black tracking-tight">Content Flow</span>
            </div>
            <p className="text-slate-500 text-sm font-medium">AI Social Marketing Platform — Built for Real Businesses.</p>
            <div className="flex items-center gap-4 pt-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Built with Gemini AI</span>
              <div className="w-1 h-1 bg-slate-300 rounded-full" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2026 Content Flow</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  </div>
  );
}
