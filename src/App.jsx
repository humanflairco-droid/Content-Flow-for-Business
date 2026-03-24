import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Zap, 
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
  RefreshCw,
  MapPin,
  Star,
  Tag,
  FileDown,
  Download,
  Trash2,
  HelpCircle
} from "lucide-react";
import { jsPDF } from "jspdf";

const INDUSTRIES = [
  "Restaurant & Café", 
  "Barbershop & Grooming", 
  "Beauty & Skincare", 
  "Wellness & Spa", 
  "Retail & Boutique", 
  "Hospitality & Hotels"
];

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: Instagram },
  { id: 'facebook', label: 'Facebook', icon: Facebook },
  { id: 'tiktok', label: 'TikTok', icon: Music2 },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { id: 'youtube', label: 'YouTube', icon: Youtube }
];

const TONES = [
  "Luxury & Premium", 
  "Fun & Playful", 
  "Urgent & Conversion", 
  "Professional & Trust", 
  "Bold & Disruptive"
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
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('contentflow_profile');
    return saved ? JSON.parse(saved) : {
      businessName: '',
      industry: 'Restaurant',
      platforms: ['instagram'],
      tone: 'Professional',
      country: 'South Africa',
      whatsapp: '',
      website: '',
      brandColor: '#4F46E5'
    };
  });

  useEffect(() => {
    localStorage.setItem('contentflow_profile', JSON.stringify(profile));
  }, [profile]);

  const [isSaving, setIsSaving] = useState(false);
  const [showSavedTick, setShowSavedTick] = useState(false);

  // Generator State
  const [topic, setTopic] = useState('');
  const [brief, setBrief] = useState(() => {
    const saved = localStorage.getItem('contentflow_brief');
    return saved ? JSON.parse(saved) : {
      businessName: '',
      location: '',
      sellingPoint: '',
      offer: '',
      industry: 'Restaurant & Café',
      platform: 'instagram',
      tone: 'Professional & Trust'
    };
  });

  useEffect(() => {
    localStorage.setItem('contentflow_brief', JSON.stringify(brief));
  }, [brief]);
  const [numPosts, setNumPosts] = useState(5);
  const [goal, setGoal] = useState('Get Bookings');
  const [loading, setLoading] = useState(false);
  const [campaign, setCampaign] = useState(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [copyStates, setCopyStates] = useState({});
  const [showHelp, setShowHelp] = useState(false);

  const [error, setError] = useState(null);

  const handleProfileChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleBriefChange = (field, value) => {
    setBrief(prev => ({ ...prev, [field]: value }));
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

  const clearProfile = () => {
    const defaultProfile = {
      businessName: '',
      industry: 'Restaurant',
      platforms: ['instagram'],
      tone: 'Professional',
      country: 'South Africa',
      whatsapp: '',
      website: '',
      brandColor: '#4F46E5'
    };
    const defaultBrief = {
      businessName: '',
      location: '',
      sellingPoint: '',
      offer: '',
      industry: 'Restaurant & Café',
      platform: 'instagram',
      tone: 'Professional & Trust'
    };
    setProfile(defaultProfile);
    setBrief(defaultBrief);
    localStorage.removeItem('contentflow_profile');
    localStorage.removeItem('contentflow_brief');
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
    if (!topic || (!brief.businessName && !profile.businessName)) return;
    setLoading(true);
    setCampaign(null);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const systemInstruction = `You are an elite social media marketing strategist with 30 years of experience in hospitality, retail, food & beverage, and beauty industries across global markets. You understand what makes customers book, buy, and return — not just scroll.

You are generating a high-converting social media campaign for:
Business: ${brief.businessName || profile.businessName}
Location: ${brief.location || profile.country}
Key Selling Point: ${brief.sellingPoint}
Special Offer: ${brief.offer}
Industry: ${brief.industry}  
Target Platform: ${brief.platform}
Brand Tone: ${brief.tone}
Market: ${profile.country}
Campaign Goal: ${goal}
Topic: ${topic}

TONE-SPECIFIC GUIDELINES:
- If Tone is "Luxury & Premium": Use sophisticated language, aspirational hooks, and elegant CTAs.
- If Tone is "Fun & Playful": Use casual energetic language, emojis, and light-hearted hooks.
- If Tone is "Urgent & Conversion": Use scarcity language, strong CTAs, and deadline-driven hooks.
- If Tone is "Professional & Trust": Use authoritative calm language, credibility-focused, and fact-driven.
- If Tone is "Bold & Disruptive": Use provocative hooks, pattern-interrupt language, and challenger brand tone.

PLATFORM-SPECIFIC GUIDELINES:
- If Platform is "instagram": Optimize hashtags, captions can be long (up to 2200 characters), use visual and aesthetic language.
- If Platform is "tiktok": Use short punchy hooks, trending casual language, minimal hashtags, high energy.
- If Platform is "facebook": Use longer conversational captions, community-focused language, fewer hashtags.
- If Platform is "youtube": Use Title and Description format, searchable keywords, longer storytelling captions.

INDUSTRY-SPECIFIC GUIDELINES:
- If Industry is "Restaurant & Café": Use food-focused sensory language (aroma, sizzle, taste), focus on atmosphere and cravings.
- If Industry is "Barbershop & Grooming": Use masculine precision language (sharp, fresh, detail-oriented), focus on confidence and craft.
- If Industry is "Beauty & Skincare": Use aspirational transformation language (glow, radiance, confidence), focus on self-care and results.
- If Industry is "Wellness & Spa": Use calm and restorative language (peace, zen, recharge), focus on relaxation and mental clarity.
- If Industry is "Retail & Boutique": Use style-focused and curated language (exclusive, trend, unique), focus on quality and aesthetic.
- If Industry is "Hospitality & Hotels": Use experience-focused and welcoming language (escape, stay, comfort), focus on service and memories.

CONTENT STRATEGY MIX:
- 60% visual/viral content (food, transformation, satisfying clips)
- 30% business pain point content (empty store, bad marketing, missed sales)
- 10% authority/positioning content

RULES:
- Business name, location, selling point, and offer must appear naturally in the hooks, on-screen text, captions, and hashtags.
- Every post must have a scroll-stopping hook in the first line
- Every caption must have a clear CTA
- Content must feel native to ${brief.platform} — not generic
- Tone must match: ${brief.tone}
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
              presenterScript: { type: Type.STRING }
            },
            required: ["whatsappMessage", "dmScript", "commentStrategy", "videoShootInstructions", "presenterScript"]
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
        model: "gemini-3-flash-preview",
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
    setBrief({
      businessName: '',
      location: '',
      sellingPoint: '',
      offer: '',
      industry: 'Restaurant & Café',
      platform: 'instagram',
      tone: 'Professional & Trust'
    });
    setImage(null);
    setImagePreview(null);
    setError(null);
  };

  const copyAllPosts = () => {
    if (!campaign) return;
    const allText = `CAMPAIGN BRIEF\n` +
      `Business: ${brief.businessName || profile.businessName}\n` +
      `Location: ${brief.location || profile.country}\n` +
      `Industry: ${brief.industry}\n` +
      `Platform: ${brief.platform}\n` +
      `Tone: ${brief.tone}\n` +
      `Selling Point: ${brief.sellingPoint}\n` +
      `Offer: ${brief.offer}\n\n` +
      `-------------------\n\n` +
      campaign.posts.map((post, index) => {
        const scenes = post.onScreenText.map(s => `${s.scene}: ${s.text}`).join('\n');
        return `POST ${index + 1} (${post.templateType})\nHOOK: ${post.hook}\n\nON-SCREEN:\n${scenes}\n\nCAPTION:\n${post.caption}\n\nHASHTAGS:\n${post.hashtags}\n\n-------------------\n`;
      }).join('\n');
    
    navigator.clipboard.writeText(allText);
    setCopyStates(prev => ({ ...prev, all: true }));
    setTimeout(() => setCopyStates(prev => ({ ...prev, all: false })), 2000);
  };

  const downloadUserGuide = () => {
    const doc = new jsPDF();
    let y = 20;
    const margin = 20;
    const pageHeight = doc.internal.pageSize.height;

    const checkPageOverflow = (heightNeeded) => {
      if (y + heightNeeded > pageHeight - 20) {
        doc.addPage();
        y = 20;
        return true;
      }
      return false;
    };

    const cleanText = (text) => {
      if (!text) return "";
      return text.replace(/[^\x00-\x7F]/g, " ").replace(/\s+/g, " ").trim();
    };

    const renderWrappedText = (text, x, width, fontSize, fontStyle, color) => {
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", fontStyle);
      doc.setTextColor(color[0], color[1], color[2]);
      
      const lines = doc.splitTextToSize(cleanText(text), width);
      lines.forEach(line => {
        checkPageOverflow(fontSize * 0.5 + 2);
        doc.text(line, x, y);
        y += (fontSize * 0.5 + 2);
      });
    };

    // Header
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229); // Indigo-600
    doc.setFont("helvetica", "bold");
    doc.text("Content Flow", margin, y);
    
    // HumanFlairCo Logo placeholder/text in PDF
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("|  HumanFlairCo", margin + 55, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.setFont("helvetica", "normal");
    doc.text("ContentFlow by HumanFlairCo — User Guide", margin, y);
    y += 15;

    // Getting Started
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.setFont("helvetica", "bold");
    doc.text("Getting Started", margin, y);
    y += 10;

    const steps = [
      "Enter your Business Name, Location, Key Selling Point and Special Offer in the Campaign Brief section",
      "Select your Industry from the dropdown",
      "Choose your Platform — Instagram, TikTok, Facebook or YouTube",
      "Select your Tone — Luxury, Playful, Urgent, Professional or Bold",
      "Click Generate Campaign",
      "Review your posts then Copy All Posts or Download as PDF"
    ];

    steps.forEach((step, i) => {
      renderWrappedText(`Step ${i + 1}: ${step}`, margin + 5, 170, 10, "normal", [71, 85, 105]);
      y += 2;
    });
    y += 10;

    // Feature Explanations
    checkPageOverflow(15);
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text("Feature Explanations", margin, y);
    y += 10;

    const features = [
      { title: "Campaign Brief", desc: "Your business details that personalise every generated post" },
      { title: "Industry Selector", desc: "Tailors language and visual direction to your specific business sector" },
      { title: "Platform Selector", desc: "Adapts caption length, hashtags and tone for each social platform" },
      { title: "Tone Selector", desc: "Controls the voice and style of your entire campaign" },
      { title: "Export", desc: "Copy All Posts copies everything to clipboard. Download as PDF creates a client-ready report" },
      { title: "Clear Profile", desc: "Resets all fields instantly so you can switch between different clients" }
    ];

    features.forEach(f => {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(f.title, margin + 5, y);
      y += 5;
      renderWrappedText(f.desc, margin + 10, 165, 10, "normal", [71, 85, 105]);
      y += 2;
    });
    y += 10;

    // Industry and Tone Guide
    checkPageOverflow(20);
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text("Industry and Tone Guide", margin, y);
    y += 10;

    // Table Header
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text("Industry", margin + 2, y);
    doc.text("Tone", margin + 50, y);
    doc.text("Best Used For", margin + 80, y);
    y += 5;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, 190, y);
    y += 7;

    const guide = [
      { industry: "Restaurant & Café", tone: "Luxury", bestUsedFor: "Fine dining aspirational content with sensory language" },
      { industry: "Restaurant & Café", tone: "Urgent", bestUsedFor: "Limited tables, book now, weekend special campaigns" },
      { industry: "Barbershop & Grooming", tone: "Professional", bestUsedFor: "Authority and trust building, legacy positioning" },
      { industry: "Barbershop & Grooming", tone: "Urgent", bestUsedFor: "Limited slots, weekend booking campaigns" },
      { industry: "Beauty & Skincare", tone: "Luxury", bestUsedFor: "Aspirational transformation, premium product focus" },
      { industry: "Beauty & Skincare", tone: "Fun & Playful", bestUsedFor: "Relatable beauty fails, glow up content" },
      { industry: "Wellness & Spa", tone: "Luxury", bestUsedFor: "Calm restorative language, escape and recharge themes" },
      { industry: "Wellness & Spa", tone: "Professional", bestUsedFor: "Expert credibility, results-focused content" },
      { industry: "Retail & Boutique", tone: "Bold", bestUsedFor: "Pattern interrupt, challenger brand language" },
      { industry: "Retail & Boutique", tone: "Urgent", bestUsedFor: "Limited stock, flash sale, FOMO-driven content" },
      { industry: "Hospitality & Hotels", tone: "Luxury", bestUsedFor: "Five star experience language, aspirational travel content" },
      { industry: "Hospitality & Hotels", tone: "Fun & Playful", bestUsedFor: "Weekend getaway, family friendly, light hearted content" }
    ];

    guide.forEach(row => {
      checkPageOverflow(10);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(row.industry, margin + 2, y);
      doc.setTextColor(79, 70, 229);
      doc.text(row.tone, margin + 50, y);
      doc.setTextColor(71, 85, 105);
      doc.setFont("helvetica", "normal");
      
      const lines = doc.splitTextToSize(row.bestUsedFor, 90);
      lines.forEach((line, idx) => {
        if (idx > 0) y += 4;
        doc.text(line, margin + 80, y);
      });
      y += 7;
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, y - 4, 190, y - 4);
    });
    y += 10;

    // FAQ
    checkPageOverflow(20);
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text("Frequently Asked Questions", margin, y);
    y += 10;

    const faqs = [
      { q: "Will my brand profile be saved if I close the browser?", a: "Yes — ContentFlow automatically saves your profile using Local Storage so your details are always remembered" },
      { q: "Can I use ContentFlow for multiple clients?", a: "Yes — use the Clear Profile button to reset all fields instantly when switching between clients" },
      { q: "How many posts does each campaign generate?", a: "Each campaign generates 3 to 5 posts depending on your industry and tone selections" },
      { q: "Can I edit the generated posts?", a: "Yes — copy the posts using Copy All Posts and edit freely in any text editor or social media platform" },
      { q: "What platforms does ContentFlow support?", a: "Instagram, TikTok, Facebook and YouTube — each optimised with platform specific language and formatting" },
      { q: "Can I download my campaign as a PDF?", a: "Yes — click Download as PDF after generating your campaign to get a professionally formatted client ready report" },
      { q: "Is my data private?", a: "Yes — all your brand profile data is stored locally on your device only and never shared" }
    ];

    faqs.forEach(faq => {
      checkPageOverflow(15);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(`Q: ${faq.q}`, margin + 5, y);
      y += 5;
      renderWrappedText(`A: ${faq.a}`, margin + 10, 165, 9, "normal", [71, 85, 105]);
      y += 3;
    });

    // Footer
    y = pageHeight - 15;
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.setFont("helvetica", "italic");
    doc.text("ContentFlow by HumanFlairCo", 105, y, { align: "center" });

    doc.save("ContentFlow_User_Guide.pdf");
  };

  const downloadAsPDF = () => {
    if (!campaign) return;
    const doc = new jsPDF();
    const margin = 20;
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 20;

    const checkPageOverflow = (heightNeeded) => {
      if (y + heightNeeded > pageHeight - 20) {
        doc.addPage();
        y = 20;
        return true;
      }
      return false;
    };

    // Helper to strip emojis and non-standard characters that helvetica can't handle
    const cleanText = (text) => {
      if (!text) return "";
      // Replace emojis and other non-standard characters with a space or empty string
      // This prevents the "garbled" text issue in jsPDF standard fonts
      return text.replace(/[^\x00-\x7F]/g, " ").replace(/\s+/g, " ").trim();
    };

    const renderWrappedText = (text, x, width, fontSize, fontStyle, color) => {
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", fontStyle);
      doc.setTextColor(color[0], color[1], color[2]);
      
      const lines = doc.splitTextToSize(cleanText(text), width);
      lines.forEach(line => {
        checkPageOverflow(fontSize * 0.5);
        doc.text(line, x, y);
        y += (fontSize * 0.5);
      });
    };

    // Header
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229); // Indigo-600
    doc.setFont("helvetica", "bold");
    doc.text("Content Flow", margin, y);
    
    // HumanFlairCo Logo placeholder/text in PDF
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("|  HumanFlairCo", margin + 55, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.setFont("helvetica", "normal");
    doc.text("ContentFlow by HumanFlairCo — Campaign Strategy", margin, y);
    y += 15;

    // Campaign Brief
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.setFont("helvetica", "bold");
    doc.text("Campaign Brief", margin, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const briefInfo = [
      ["Business Name", brief.businessName || profile.businessName],
      ["Location", brief.location || profile.country],
      ["Industry", brief.industry],
      ["Platform", brief.platform],
      ["Tone", brief.tone],
      ["Key Selling Point", brief.sellingPoint || "N/A"],
      ["Special Offer", brief.offer || "N/A"]
    ];

    briefInfo.forEach(([label, value]) => {
      checkPageOverflow(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(`${label}:`, margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(`${cleanText(value)}`, margin + 40, y);
      y += 7;
    });
    y += 10;

    // Posts
    campaign.posts.forEach((post, index) => {
      checkPageOverflow(20);

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(79, 70, 229);
      doc.text(`POST ${index + 1} - ${getTemplateLabel(post.templateType)}`, margin, y);
      y += 10;

      // Hook
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.text("Hook:", margin, y);
      y += 6;
      renderWrappedText(`"${post.hook}"`, margin + 5, 170, 11, "italic", [15, 23, 42]);
      y += 5;

      // Visual Flow
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("Visual Flow:", margin, y);
      y += 7;
      post.onScreenText.forEach(scene => {
        renderWrappedText(`${scene.scene}: ${scene.text}`, margin + 5, 170, 10, "normal", [71, 85, 105]);
        y += 2;
      });
      y += 5;

      // Caption
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("Caption:", margin, y);
      y += 7;
      renderWrappedText(post.caption, margin, 170, 10, "normal", [71, 85, 105]);
      y += 5;

      // Hashtags
      renderWrappedText(post.hashtags, margin, 170, 10, "italic", [79, 70, 229]);
      y += 10;
      
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y - 5, 190, y - 5);
      y += 10;
    });

    // Footer
    y = pageHeight - 10;
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.setFont("helvetica", "italic");
    doc.text("ContentFlow by HumanFlairCo", 105, y, { align: "center" });

    doc.save(`${(brief.businessName || profile.businessName).replace(/\s+/g, '_')}_Campaign.pdf`);
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
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
                  <Zap className="w-5 h-5 text-white fill-current" />
                </div>
                <h1 className="text-2xl font-black tracking-tighter text-slate-900">
                  Content<span className="text-indigo-600">Flow</span>
                </h1>
              </div>
              
              <div className="h-8 w-px bg-slate-200 hidden sm:block" />
              
              <div className="flex items-center gap-2">
                <img 
                  src="https://ais-pre-nq5qya745tvyal2lanrecm-276105778419.europe-west2.run.app/humanflairco-logo.png" 
                  alt="HumanFlairCo" 
                  className="h-8 w-auto"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <span className="text-sm font-black tracking-tight text-slate-900 hidden sm:block">HumanFlairCo</span>
              </div>
            </div>
            <p className="text-[10px] sm:text-xs font-medium text-slate-500 mt-0.5 tracking-wide uppercase">
              By HumanFlairCo — Social Marketing. Built for Real Businesses.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowHelp(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-white hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Help</span>
            </button>
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
            <p className="text-sm font-bold">Unlimited Campaign Credits</p>
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
              {/* Campaign Brief Section */}
              <div className="space-y-6 pb-8 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Campaign Brief</h3>
                  </div>
                  <button 
                    onClick={clearProfile}
                    className="text-[10px] font-black text-slate-400 hover:text-red-500 transition-all uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-3 h-3" /> Clear Profile
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <Building2 className="w-3 h-3" /> Business Name
                    </label>
                    <input 
                      type="text"
                      value={brief.businessName}
                      onChange={(e) => handleBriefChange('businessName', e.target.value)}
                      placeholder={profile.businessName || "e.g. The Golden Grill"}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <MapPin className="w-3 h-3" /> Location
                    </label>
                    <input 
                      type="text"
                      value={brief.location}
                      onChange={(e) => handleBriefChange('location', e.target.value)}
                      placeholder="e.g. Sandton, Johannesburg"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <Star className="w-3 h-3" /> Key Selling Point
                    </label>
                    <input 
                      type="text"
                      value={brief.sellingPoint}
                      onChange={(e) => handleBriefChange('sellingPoint', e.target.value)}
                      placeholder="e.g. 30 years experience"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <Tag className="w-3 h-3" /> Special Offer
                    </label>
                    <input 
                      type="text"
                      value={brief.offer}
                      onChange={(e) => handleBriefChange('offer', e.target.value)}
                      placeholder="e.g. 20% off this weekend"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Briefcase className="w-3 h-3" /> Industry Selector
                  </label>
                  <select 
                    value={brief.industry}
                    onChange={(e) => handleBriefChange('industry', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm bg-white text-slate-900"
                  >
                    {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                  </select>
                </div>

                <div className="space-y-3 pt-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Smartphone className="w-3 h-3" /> Platform Selector
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORMS.filter(p => ['instagram', 'tiktok', 'facebook', 'youtube'].includes(p.id)).map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => handleBriefChange('platform', id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-sm font-medium ${
                          brief.platform === id
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

                <div className="space-y-3 pt-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Palette className="w-3 h-3" /> Tone & Style Selector
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TONES.map(tone => (
                      <button
                        key={tone}
                        onClick={() => handleBriefChange('tone', tone)}
                        className={`px-4 py-2 rounded-full border transition-all text-sm font-medium ${
                          brief.tone === tone
                            ? 'bg-orange-500 border-orange-500 text-white shadow-md'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-orange-300'
                        }`}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-indigo-500" />
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
                disabled={loading || !topic || (!brief.businessName && !profile.businessName)}
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
                    <Zap className="w-10 h-10 text-indigo-600 fill-current" />
                  </div>
                  <div className="absolute inset-0 w-20 h-20 bg-indigo-400 rounded-full animate-ping opacity-20" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-black text-slate-900">Crafting Your Viral Campaign...</h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto">Our strategist is analyzing your brand and market trends to build high-converting content.</p>
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
                          {(() => {
                            const p = brief.platform;
                            const PlatformIcon = PLATFORMS.find(pl => pl.id === p)?.icon || Globe;
                            return (
                              <span key={p} className="w-8 h-8 bg-white border border-indigo-200 rounded-lg flex items-center justify-center text-indigo-600 shadow-sm" title={p}>
                                <PlatformIcon className="w-5 h-5" />
                              </span>
                            );
                          })()}
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

                {/* Export Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                  <button 
                    onClick={copyAllPosts}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-base hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
                  >
                    {copyStates.all ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    {copyStates.all ? 'Copied Campaign!' : 'Copy All Posts'}
                  </button>
                  <button 
                    onClick={downloadAsPDF}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-white border-2 border-slate-200 text-slate-900 rounded-2xl font-black text-base hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-lg active:scale-95"
                  >
                    <FileDown className="w-5 h-5" />
                    Download as PDF
                  </button>
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
                          <Users className="w-4 h-4 text-indigo-600" /> Presenter Script
                        </h4>
                        <button onClick={() => copyToClipboard(campaign.batchAssets.presenterScript, 'script')} className="text-slate-400 hover:text-indigo-600">
                          {copyStates.script ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl leading-relaxed">{campaign.batchAssets.presenterScript}</p>
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
              <Zap className="w-5 h-5 text-indigo-600 fill-current" />
              <span className="text-lg font-black tracking-tight">Content Flow</span>
            </div>
            <p className="text-slate-500 text-sm font-medium">ContentFlow by HumanFlairCo • Built for Growth • © 2026</p>
          </div>
        </footer>
      </main>
    </div>
    
    {/* Help Modal */}
    {showHelp && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-600">
            <div className="flex items-center gap-3 text-white">
              <HelpCircle className="w-6 h-6" />
              <h2 className="text-xl font-black tracking-tight">ContentFlow by HumanFlairCo — Help Center</h2>
            </div>
            <button 
              onClick={() => setShowHelp(false)}
              className="p-2 hover:bg-white/10 rounded-xl text-white transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-600">
                <Zap className="w-5 h-5 fill-current" />
                <h3 className="text-lg font-black uppercase tracking-wider">Getting Started</h3>
              </div>
              
              <div className="space-y-4">
                {[
                  "Enter your Business Name, Location, Key Selling Point and Special Offer in the Campaign Brief section",
                  "Select your Industry from the dropdown",
                  "Choose your Platform — Instagram, TikTok, Facebook or YouTube",
                  "Select your Tone — Luxury, Playful, Urgent, Professional or Bold",
                  "Click Generate Campaign",
                  "Review your posts then Copy All Posts or Download as PDF"
                ].map((step, i) => (
                  <div key={i} className="flex gap-4 items-start group">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500 font-black text-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      {i + 1}
                    </div>
                    <div className="pt-1">
                      <p className="text-slate-600 font-medium leading-relaxed">
                        <span className="font-bold text-slate-900">Step {i + 1}:</span> {step}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-indigo-600">
                <LayoutDashboard className="w-5 h-5" />
                <h3 className="text-lg font-black uppercase tracking-wider">Feature Explanations</h3>
              </div>
              
              <div className="space-y-4">
                {[
                  { title: "Campaign Brief", desc: "Your business details that personalise every generated post" },
                  { title: "Industry Selector", desc: "Tailors language and visual direction to your specific business sector" },
                  { title: "Platform Selector", desc: "Adapts caption length, hashtags and tone for each social platform" },
                  { title: "Tone Selector", desc: "Controls the voice and style of your entire campaign" },
                  { title: "Export", desc: "Copy All Posts copies everything to clipboard. Download as PDF creates a client-ready report" },
                  { title: "Clear Profile", desc: "Resets all fields instantly so you can switch between different clients" }
                ].map((feature, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-slate-900 font-bold text-sm uppercase tracking-wide">{feature.title}</p>
                      <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-indigo-600">
                <Palette className="w-5 h-5" />
                <h3 className="text-lg font-black uppercase tracking-wider">Industry and Tone Guide</h3>
              </div>
              
              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-100">Industry</th>
                      <th className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-100">Tone</th>
                      <th className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-100">Best Used For</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {[
                      { industry: "Restaurant & Café", tone: "Luxury", bestUsedFor: "Fine dining aspirational content with sensory language" },
                      { industry: "Restaurant & Café", tone: "Urgent", bestUsedFor: "Limited tables, book now, weekend special campaigns" },
                      { industry: "Barbershop & Grooming", tone: "Professional", bestUsedFor: "Authority and trust building, legacy positioning" },
                      { industry: "Barbershop & Grooming", tone: "Urgent", bestUsedFor: "Limited slots, weekend booking campaigns" },
                      { industry: "Beauty & Skincare", tone: "Luxury", bestUsedFor: "Aspirational transformation, premium product focus" },
                      { industry: "Beauty & Skincare", tone: "Fun & Playful", bestUsedFor: "Relatable beauty fails, glow up content" },
                      { industry: "Wellness & Spa", tone: "Luxury", bestUsedFor: "Calm restorative language, escape and recharge themes" },
                      { industry: "Wellness & Spa", tone: "Professional", bestUsedFor: "Expert credibility, results-focused content" },
                      { industry: "Retail & Boutique", tone: "Bold", bestUsedFor: "Pattern interrupt, challenger brand language" },
                      { industry: "Retail & Boutique", tone: "Urgent", bestUsedFor: "Limited stock, flash sale, FOMO-driven content" },
                      { industry: "Hospitality & Hotels", tone: "Luxury", bestUsedFor: "Five star experience language, aspirational travel content" },
                      { industry: "Hospitality & Hotels", tone: "Fun & Playful", bestUsedFor: "Weekend getaway, family friendly, light hearted content" }
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 text-xs font-bold text-slate-900">{row.industry}</td>
                        <td className="p-3 text-xs font-medium text-indigo-600">{row.tone}</td>
                        <td className="p-3 text-xs text-slate-600 leading-relaxed">{row.bestUsedFor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-indigo-600">
                <MessageSquare className="w-5 h-5" />
                <h3 className="text-lg font-black uppercase tracking-wider">Frequently Asked Questions</h3>
              </div>
              
              <div className="space-y-6">
                {[
                  { q: "Will my brand profile be saved if I close the browser?", a: "Yes — ContentFlow automatically saves your profile using Local Storage so your details are always remembered" },
                  { q: "Can I use ContentFlow for multiple clients?", a: "Yes — use the Clear Profile button to reset all fields instantly when switching between clients" },
                  { q: "How many posts does each campaign generate?", a: "Each campaign generates 3 to 5 posts depending on your industry and tone selections" },
                  { q: "Can I edit the generated posts?", a: "Yes — copy the posts using Copy All Posts and edit freely in any text editor or social media platform" },
                  { q: "What platforms does ContentFlow support?", a: "Instagram, TikTok, Facebook and YouTube — each optimised with platform specific language and formatting" },
                  { q: "Can I download my campaign as a PDF?", a: "Yes — click Download as PDF after generating your campaign to get a professionally formatted client ready report" },
                  { q: "Is my data private?", a: "Yes — all your brand profile data is stored locally on your device only and never shared" }
                ].map((faq, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-slate-900 font-bold text-sm leading-tight">Q: {faq.q}</p>
                    <p className="text-slate-600 text-sm leading-relaxed">A: {faq.a}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
          
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
            <button 
              onClick={downloadUserGuide}
              className="w-full py-4 bg-white border-2 border-slate-200 text-slate-900 rounded-2xl font-black uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3"
            >
              <FileDown className="w-5 h-5" />
              Download User Guide
            </button>
            <button 
              onClick={() => setShowHelp(false)}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200"
            >
              Got it, Thanks!
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
  );
}
