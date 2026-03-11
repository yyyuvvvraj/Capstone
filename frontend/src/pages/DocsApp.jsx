import React, { useState } from 'react';
import { 
  Save, 
  Share2, 
  Download, 
  Type, 
  Bold, 
  Italic, 
  Underline, 
  List, 
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DocsApp = () => {
    const [content, setContent] = useState('Project Mercury: Technical Architecture Overview\n\nIntroduction\nThe purpose of this document is to outline the core components of the Project Mercury architecture. We aim to leverage cloud-native services to ensure scalability and high availability.\n\nKey Components\n1. Frontend: React with Tailwind CSS\n2. Backend: Node.js Microservices\n3. Database: Distributed NoSQL system\n\nSecurity Considerations\nWe will implement zero-trust networking and continuous behavioral authentication to protect sensitive user data.');
    const navigate = useNavigate();

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Toolbar */}
            <div className="bg-card border border-border rounded-t-3xl p-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/')} className="p-2 hover:bg-accent rounded-xl text-muted-foreground">
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-lg font-bold leading-none">Architecture_Draft.v1</h2>
                        <p className="text-xs text-muted-foreground mt-1">Last saved 5 mins ago</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-xl font-bold transition-all">
                        <Share2 size={16} />
                        Share
                    </button>
                    <button className="flex items-center gap-2 bg-primary text-primary-foreground hover:opacity-90 px-4 py-2 rounded-xl font-bold transition-all shadow-lg shadow-primary/20">
                        <Save size={16} />
                        Save
                    </button>
                    <button className="p-2 hover:bg-accent rounded-xl text-muted-foreground ml-2 border border-border">
                        <Download size={18} />
                    </button>
                </div>
            </div>

            <div className="bg-accent/20 p-4 flex gap-4 overflow-x-auto border-x border-border">
                <div className="flex items-center gap-1 pr-4 border-r border-border/50">
                    <button className="p-2 hover:bg-accent rounded-lg"><Type size={16} /></button>
                    <button className="px-3 py-1 hover:bg-accent rounded-lg text-xs font-bold">Arial v</button>
                    <button className="px-2 py-1 hover:bg-accent rounded-lg text-xs font-bold">12</button>
                </div>
                <div className="flex items-center gap-1 pr-4 border-r border-border/50 text-muted-foreground">
                    <button className="p-2 hover:bg-accent rounded-lg"><Bold size={16} /></button>
                    <button className="p-2 hover:bg-accent rounded-lg"><Italic size={16} /></button>
                    <button className="p-2 hover:bg-accent rounded-lg"><Underline size={16} /></button>
                </div>
                <div className="flex items-center gap-1 pr-4 border-r border-border/50 text-muted-foreground">
                    <button className="p-2 hover:bg-accent rounded-lg"><AlignLeft size={16} /></button>
                    <button className="p-2 hover:bg-accent rounded-lg"><AlignCenter size={16} /></button>
                    <button className="p-2 hover:bg-accent rounded-lg"><AlignRight size={16} /></button>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                    <button className="p-2 hover:bg-accent rounded-lg"><List size={16} /></button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 bg-accent/10 border-x border-b border-border rounded-b-3xl overflow-auto p-4 md:p-12 lg:p-24 flex justify-center">
                <div className="w-full max-w-4xl bg-card shadow-xl border border-border min-h-full p-12 md:p-16 rounded-sm relative ring-1 ring-border shadow-black/5">
                   <textarea 
                        className="w-full h-full bg-transparent border-none outline-none resize-none font-serif text-lg leading-relaxed text-foreground placeholder-muted-foreground"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Start typing..."
                   />
                </div>
            </div>
        </div>
    );
};

export default DocsApp;
