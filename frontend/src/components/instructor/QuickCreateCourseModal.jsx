import React, { useState } from 'react';
import axios from 'axios';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sparkles,
    Plus,
    Loader2,
    ArrowRight,
    ArrowLeft,
    Trash2,
    Check,
    BookOpen,
    DollarSign,
    Image as ImageIcon,
    Search,
    Video,
    HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const categories = ['Programming', 'Design', 'Business', 'Marketing', 'Photography', 'Music', 'Health', 'Language'];
const levels = ['Beginner', 'Intermediate', 'Advanced'];
const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Arabic', 'Hindi', 'Portuguese'];

export default function QuickCreateCourseModal({ open, onOpenChange, onSuccess }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [aiGenerating, setAiGenerating] = useState(null);
    const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Programming',
        level: 'Beginner',
        language: 'English',
        requirements: [''],
        outcomes: [''],
        faqs: [{ question: '', answer: '' }],
        price: 0,
        discount_price: null,
        thumbnail: '',
        video_platform: 'youtube',
        preview_video: '',
        meta_keywords: '',
        meta_description: '',
        drip_content: false
    });

    const nextStep = () => {
        if (step === 1 && (!formData.title.trim() || !formData.description.trim())) {
            toast.error('Please fill in title and description');
            return;
        }
        setStep(prev => Math.min(prev + 1, 5));
    };

    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    const handleAddField = (field) => {
        if (field === 'faqs') {
            setFormData({ ...formData, faqs: [...formData.faqs, { question: '', answer: '' }] });
        } else {
            setFormData({ ...formData, [field]: [...formData[field], ''] });
        }
    };

    const handleRemoveField = (field, index) => {
        const list = [...formData[field]];
        list.splice(index, 1);
        setFormData({ ...formData, [field]: list });
    };

    const handleFieldChange = (field, index, value) => {
        const list = [...formData[field]];
        list[index] = value;
        setFormData({ ...formData, [field]: list });
    };

    const handleFaqChange = (index, field, value) => {
        const list = [...formData.faqs];
        list[index][field] = value;
        setFormData({ ...formData, faqs: list });
    };

    const generateWithAI = async (target) => {
        if (!formData.title) {
            toast.error('Please enter a course title first');
            return;
        }

        setAiGenerating(target);
        try {
            let prompt = '';
            if (target === 'description') {
                prompt = `Generate a compelling course description for a course titled "${formData.title}" in the ${formData.category} category. Keep it to 2-3 sentences.`;
            } else if (target === 'requirements') {
                prompt = `List 3-4 professional requirements for a course titled "${formData.title}". Return as a simple list separated by newlines.`;
            } else if (target === 'outcomes') {
                prompt = `List 3-4 key learning outcomes for a course titled "${formData.title}". Return as a simple list separated by newlines.`;
            }

            const token = localStorage.getItem('token');
            const response = await axios.post(`${API}/ai/course-assistant?prompt=${encodeURIComponent(prompt)}`, null, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const aiContent = response.data.response;

            if (target === 'description') {
                setFormData(prev => ({ ...prev, description: aiContent }));
            } else {
                const items = aiContent.split('\n').filter(i => i.trim()).map(i => i.replace(/^[0-9*.-]\s*/, '').trim());
                setFormData(prev => ({ ...prev, [target]: items }));
            }

            toast.success(`AI ${target} generated!`);
        } catch (error) {
            toast.error(`Failed to generate ${target}`);
        } finally {
            setAiGenerating(null);
        }
    };

    const handleThumbnailUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('file', file);

        setUploadingThumbnail(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API}/upload/thumbnail`, uploadData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setFormData(prev => ({ ...prev, thumbnail: `${BACKEND_URL}${response.data.url}` }));
            toast.success('Thumbnail uploaded!');
        } catch (error) {
            toast.error('Upload failed');
        } finally {
            setUploadingThumbnail(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...formData,
                price: parseFloat(formData.price) || 0,
                discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
                requirements: formData.requirements.filter(r => r.trim()),
                outcomes: formData.outcomes.filter(o => o.trim()),
                faqs: formData.faqs.filter(f => f.question.trim() && f.answer.trim())
            };

            const response = await axios.post(`${API}/courses`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Course created! Now add your lessons.');
            onSuccess(response.data.id);
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to create course');
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Course Title *</Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Master React in 30 Days"
                                className="rounded-xl border-slate-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-semibold">Short Description *</Label>
                                <Button
                                    type="button" variant="ghost" size="sm"
                                    onClick={() => generateWithAI('description')}
                                    className="text-indigo-600 hover:text-indigo-700 h-8 font-bold"
                                    disabled={!!aiGenerating}
                                >
                                    <Sparkles size={14} className="mr-1" /> AI Writer
                                </Button>
                            </div>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Hook your students with a great summary..."
                                className="rounded-xl min-h-[100px] border-slate-200"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Category</Label>
                                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                                    <SelectTrigger className="rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Difficulty</Label>
                                <Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v })}>
                                    <SelectTrigger className="rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {levels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Check className="text-indigo-600" size={18} />
                                    <Label className="text-sm font-bold">What will they learn?</Label>
                                </div>
                                <Button type="button" variant="ghost" size="sm" onClick={() => generateWithAI('outcomes')} disabled={!!aiGenerating} className="text-indigo-600 h-8 font-bold">
                                    <Sparkles size={14} className="mr-1" /> AI Suggest
                                </Button>
                            </div>
                            {formData.outcomes.map((out, i) => (
                                <div key={i} className="flex gap-2">
                                    <Input value={out} onChange={(e) => handleFieldChange('outcomes', i, e.target.value)} className="rounded-xl border-slate-200" placeholder="e.g. Build real-world apps" />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveField('outcomes', i)} disabled={formData.outcomes.length === 1}>
                                        <Trash2 size={16} className="text-slate-400" />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => handleAddField('outcomes')} className="w-full rounded-xl border-dashed py-5 border-slate-300">
                                <Plus size={14} className="mr-1" /> Add Learning Outcome
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <HelpCircle className="text-slate-400" size={18} />
                                <Label className="text-sm font-bold text-slate-700">Frequently Asked Questions</Label>
                            </div>
                            {formData.faqs.map((faq, i) => (
                                <div key={i} className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                                    <Input
                                        value={faq.question}
                                        onChange={(e) => handleFaqChange(i, 'question', e.target.value)}
                                        placeholder="Question"
                                        className="rounded-xl border-slate-200 bg-white"
                                    />
                                    <Textarea
                                        value={faq.answer}
                                        onChange={(e) => handleFaqChange(i, 'answer', e.target.value)}
                                        placeholder="Answer"
                                        className="rounded-xl border-slate-200 bg-white min-h-[60px]"
                                    />
                                    {formData.faqs.length > 1 && (
                                        <Button
                                            type="button" variant="destructive" size="icon"
                                            onClick={() => handleRemoveField('faqs', i)}
                                            className="absolute -right-2 -top-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Plus size={12} className="rotate-45" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => handleAddField('faqs')} className="w-full rounded-xl border-dashed py-5 border-slate-300">
                                <Plus size={14} className="mr-1" /> Add FAQ
                            </Button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Course Language</Label>
                                <Select value={formData.language} onValueChange={(v) => setFormData({ ...formData, language: v })}>
                                    <SelectTrigger className="rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {languages.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Difficulty Level</Label>
                                <Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v })}>
                                    <SelectTrigger className="rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {levels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Price (USD)</Label>
                                <div className="relative">
                                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="rounded-xl pl-8 border-slate-200"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Discount Price</Label>
                                <div className="relative">
                                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        type="number"
                                        value={formData.discount_price || ''}
                                        onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                                        className="rounded-xl pl-8 border-slate-200"
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="drip"
                                checked={formData.drip_content}
                                onChange={(e) => setFormData({ ...formData, drip_content: e.target.checked })}
                                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <Label htmlFor="drip" className="text-sm font-medium text-slate-700 cursor-pointer">
                                Enable Drip Content (Timed content release)
                            </Label>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Course Thumbnail</Label>
                            <div
                                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer relative overflow-hidden group"
                                onClick={() => document.getElementById('thumb-input').click()}
                            >
                                {formData.thumbnail ? (
                                    <img src={formData.thumbnail} alt="Thumbnail" className="absolute inset-0 w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <ImageIcon className="w-10 h-10 text-slate-300 mb-2 group-hover:scale-110 transition-transform" />
                                        <p className="text-sm text-slate-500 font-medium">
                                            {uploadingThumbnail ? 'Uploading...' : 'Click or drag image to upload'}
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-1">Recommended: 1280x720 (16:9)</p>
                                    </>
                                )}
                                <input id="thumb-input" type="file" hidden onChange={handleThumbnailUpload} accept="image/*" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Video Provider</Label>
                                <Select value={formData.video_platform} onValueChange={(v) => setFormData({ ...formData, video_platform: v })}>
                                    <SelectTrigger className="rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="youtube">YouTube</SelectItem>
                                        <SelectItem value="vimeo">Vimeo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Trailer URL</Label>
                                <Input
                                    value={formData.preview_video}
                                    onChange={(e) => setFormData({ ...formData, preview_video: e.target.value })}
                                    placeholder="Link to course trailer"
                                    className="rounded-xl border-slate-200"
                                />
                            </div>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Meta Keywords</Label>
                            <Input
                                value={formData.meta_keywords}
                                onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                                placeholder="react, web-dev, beginner tutorial"
                                className="rounded-xl border-slate-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Meta Description</Label>
                            <Textarea
                                value={formData.meta_description}
                                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                placeholder="How your course appears in search results..."
                                className="rounded-xl min-h-[100px] border-slate-200"
                            />
                        </div>
                        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="flex items-center gap-2 mb-2">
                                <Search size={14} className="text-blue-500" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Google Preview</span>
                            </div>
                            <h4 className="text-blue-600 text-lg font-medium truncate hover:underline cursor-pointer">{formData.title || 'Course Title Preview'}</h4>
                            <p className="text-emerald-700 text-xs mb-1">https://britsyncaiacademy.online/courses/{formData.title.toLowerCase().replace(/ /g, '-') || 'url'}</p>
                            <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
                                {formData.meta_description || 'Write a meta description to see how your course will look on search engine results pages.'}
                            </p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const steps = [
        { title: 'Basics', icon: BookOpen },
        { title: 'Information', icon: Sparkles },
        { title: 'Curriculum', icon: DollarSign },
        { title: 'Media', icon: Video },
        { title: 'SEO', icon: Search }
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[650px] rounded-[2.5rem] p-0 overflow-hidden shadow-2xl border-none">
                <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-black p-8 text-white">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                <Plus size={24} className="text-indigo-300" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black tracking-tight">Create Course</DialogTitle>
                                <p className="text-indigo-300/70 text-sm font-medium">Step {step} of 5 • {steps[step - 1].title}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {steps.map((s, i) => (
                                <div
                                    key={i}
                                    className={`h-1 rounded-full transition-all duration-500 ${i + 1 === step ? 'w-10 bg-indigo-500' :
                                        i + 1 < step ? 'w-6 bg-emerald-500' : 'w-6 bg-white/20'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-between px-2">
                        {steps.map((s, i) => {
                            const Icon = s.icon;
                            const isActive = step === i + 1;
                            const isPast = step > i + 1;
                            return (
                                <div key={i} className="flex flex-col items-center gap-2 group">
                                    <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-white text-indigo-900 scale-110 shadow-xl' :
                                        isPast ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/50 border border-white/10'
                                        }`}>
                                        {isPast ? <Check size={20} /> : <Icon size={20} />}
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest transition-opacity duration-300 ${isActive ? 'opacity-100 text-indigo-300' : 'opacity-40'}`}>
                                        {s.title}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-10 max-h-[55vh] overflow-y-auto custom-scrollbar bg-white">
                    {renderStepContent()}
                </div>

                <div className="p-8 bg-slate-50 flex items-center justify-between border-t border-slate-100">
                    <Button
                        variant="ghost"
                        onClick={step === 1 ? () => onOpenChange(false) : prevStep}
                        className="rounded-2xl px-6 h-12 text-slate-500 font-bold hover:bg-slate-100"
                    >
                        {step === 1 ? 'Discard' : 'Go Back'}
                    </Button>

                    <div className="flex gap-3">
                        {step < 5 ? (
                            <Button
                                onClick={nextStep}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-10 h-12 font-black shadow-lg shadow-indigo-100 transition-all hover:translate-x-1"
                            >
                                Next Step
                                <ArrowRight size={18} className="ml-2" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl px-12 h-12 font-black shadow-2xl transition-all hover:scale-105 active:scale-95"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Deploying...
                                    </>
                                ) : (
                                    <>
                                        Create & Setup
                                        <Check size={20} className="ml-2" />
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
