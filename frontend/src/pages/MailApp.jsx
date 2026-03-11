import React, { useState } from 'react';
import { 
  Search, 
  Trash2, 
  Archive, 
  Mail as MailIcon, 
  Send,
  Star,
  MoreVertical,
  Paperclip
} from 'lucide-react';

const MailApp = () => {
    const [selectedEmail, setSelectedEmail] = useState(0);

    const emails = [
      { 
        id: 0, 
        sender: 'Security Admin', 
        subject: 'Annual Compliance Review Required', 
        time: '10:45 AM', 
        content: "Hello team, This is a reminder that the annual compliance review is due by the end of this month. Please ensure all documents are updated in the Nexus portal.",
        unread: true
      },
      { 
        id: 1, 
        sender: 'HR Department', 
        subject: 'New Office Policy Update', 
        time: 'Yesterday', 
        content: "Please find attached the updated office policy regarding remote work and flex hours. These changes take effect starting immediately.",
        unread: false
      },
      { 
        id: 2, 
        sender: 'Project Mercury', 
        subject: 'Design Feedback Phase 1', 
        time: 'Mar 10', 
        content: "The feedback from the client for phase 1 of Project Mercury has been received. There are some minor adjustments needed for the primary dashboard UI.",
        unread: false
      }
    ];

    return (
      <div className="h-[calc(100vh-120px)] flex bg-card border border-border rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        {/* Email List */}
        <div className="w-80 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input 
                type="text" 
                placeholder="Search mail..." 
                className="w-full bg-accent/50 border-none rounded-xl py-2 pl-9 pr-4 text-sm outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            {emails.map((email) => (
              <div 
                key={email.id}
                onClick={() => setSelectedEmail(email.id)}
                className={`p-4 cursor-pointer transition-colors border-b border-border/50 ${
                  selectedEmail === email.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-accent/30'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-bold ${email.unread ? 'text-foreground' : 'text-muted-foreground'}`}>{email.sender}</span>
                  <span className="text-[10px] text-muted-foreground capitalize">{email.time}</span>
                </div>
                <h4 className="text-xs font-semibold truncate mb-1">{email.subject}</h4>
                <p className="text-[10px] text-muted-foreground line-clamp-2">{email.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Email Content */}
        <div className="flex-1 flex flex-col">
          {emails[selectedEmail] && (
            <>
              <div className="p-4 border-b border-border flex justify-between items-center">
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-accent rounded-lg text-muted-foreground"><Archive size={18} /></button>
                  <button className="p-2 hover:bg-accent rounded-lg text-muted-foreground"><Trash2 size={18} /></button>
                  <button className="p-2 hover:bg-accent rounded-lg text-muted-foreground"><MailIcon size={18} /></button>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-accent rounded-lg text-muted-foreground"><MoreVertical size={18} /></button>
                </div>
              </div>
              <div className="flex-1 p-8 overflow-auto">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {emails[selectedEmail].sender[0]}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{emails[selectedEmail].sender}</h2>
                      <p className="text-sm text-muted-foreground">to: me@nexus-os.com</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{emails[selectedEmail].time}</p>
                    <button className="text-muted-foreground hover:text-primary mt-2"><Star size={18} /></button>
                  </div>
                </div>
                <h1 className="text-2xl font-bold mb-6">{emails[selectedEmail].subject}</h1>
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                  {emails[selectedEmail].content.split('\n').map((para, i) => (
                    <p key={i} className="mb-4">{para}</p>
                  ))}
                </div>

                <div className="mt-12 p-6 border border-dashed border-border rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Paperclip className="text-muted-foreground" size={20} />
                    <div>
                      <p className="text-sm font-bold">Attachment.pdf</p>
                      <p className="text-xs text-muted-foreground">2.4 MB</p>
                    </div>
                  </div>
                  <button className="text-primary text-sm font-bold hover:underline">Download</button>
                </div>
              </div>
              <div className="p-6 border-t border-border flex gap-4">
                <div className="flex-1 relative">
                    <textarea 
                        placeholder="Type your reply..." 
                        className="w-full bg-accent/30 border border-border rounded-2xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-primary/50 resize-none h-12 transition-all hover:h-32"
                    />
                    <Send className="absolute right-4 bottom-4 text-primary cursor-pointer" size={18} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
};

export default MailApp;
