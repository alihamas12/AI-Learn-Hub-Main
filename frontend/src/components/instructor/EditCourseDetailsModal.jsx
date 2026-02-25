import React, { useState, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Loader2,
    Save,
    Sparkles,
    Plus,
    Trash2,
    BookOpen,
    ListChecks,
    DollarSign,
    Image as ImageIcon,
    Search,
    HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const categories = ['Programming', 'Design', 'Business', 'Marketing', 'Photography', 'Music', 'Health', 'Language'];
const levels = ['Beginner', 'Intermediate', 'Advanced'];
const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Arabic', 'Hindi', 'Portuguese'];

export default function EditCourseDetailsModal({ open, onOpenChange, course, onSuccess }) {
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

    useEffect(() => {
        if (course) {
            setFormData({
                title: course.title || '',
                description: course.description || '',
                category: course.category || 'Programming',
                level: course.level || 'Beginner',
                language: course.language || 'English',
                requirements: course.requirements?.length ? course.requirements : [''],
                outcomes: course.outcomes?.length ? course.outcomes : [''],
                faqs: course.faqs?.length ? course.faqs : [{ question: '', answer: '' }],
                price: course.price || 0,
                discount_price: course.discount_price || null,
                thumbnail: course.thumbnail || '',
                video_platform: course.video_platform || 'youtube',
                preview_video: course.preview_video || '',
                meta_keywords: course.meta_keywords || '',
                meta_description: course.meta_description || '',
                drip_content: course.drip_content || false
            });
        }
    }, [course]);

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
                prompt = `Generate a compelling course description for a course titled "${formData.title}" in the ${formData.category} category.`;
            } else if (target === 'requirements') {
                prompt = `List 3-4 professional requirements for a course titled "${formData.title}". Return as a list.`;
            } else if (target === 'outcomes') {
                prompt = `List 3-4 key learning outcomes for a course titled "${formData.title}". Return as a list.`;
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
            toast.error('AI generation failed');
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

            await axios.patch(`${API}/courses/${course.id}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Course details updated successfully!');
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to update course details');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] rounded-3xl p-0 overflow-hidden font-sans">
                <DialogHeader className="p-6 bg-indigo-900 border-b border-indigo-800 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                            <BookOpen size={20} className="text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black">Edit Course Details</DialogTitle>
                            <DialogDescription className="text-indigo-200">
                                Course ID: {course?.id}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <Tabs defaultValue="general" className="w-full">
                    <div className="px-6 bg-slate-50 border-b border-slate-200">
                        <TabsList className="bg-transparent h-12 gap-6 p-0">
                            <TabsTrigger value="general" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 bg-transparent px-1 font-bold text-slate-500 data-[state=active]:text-indigo-600 transition-all">General</TabsTrigger>
                            <TabsTrigger value="info" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 bg-transparent px-1 font-bold text-slate-500 data-[state=active]:text-indigo-600 transition-all">Content</TabsTrigger>
                            <TabsTrigger value="faqs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 bg-transparent px-1 font-bold text-slate-500 data-[state=active]:text-indigo-600 transition-all">FAQs</TabsTrigger>
                            <TabsTrigger value="pricing" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 bg-transparent px-1 font-bold text-slate-500 data-[state=active]:text-indigo-600 transition-all">Pricing</TabsTrigger>
                            <TabsTrigger value="media" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 bg-transparent px-1 font-bold text-slate-500 data-[state=active]:text-indigo-600 transition-all">Media & SEO</TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        <TabsContent value="general" className="mt-0 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Course Title</Label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="rounded-xl border-slate-200"
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
                                        <Label className="text-sm font-semibold">Level</Label>
                                        <Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v })}>
                                            <SelectTrigger className="rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                {levels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-semibold">Description</Label>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => generateWithAI('description')} disabled={!!aiGenerating} className="text-indigo-600 h-8 font-bold">
                                            <Sparkles size={14} className="mr-1" /> AI Rewrite
                                        </Button>
                                    </div>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="rounded-xl min-h-[120px] border-slate-200"
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="info" className="mt-0 space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ListChecks size={18} className="text-indigo-600" />
                                        <Label className="text-sm font-bold">Requirements</Label>
                                    </div>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => generateWithAI('requirements')} disabled={!!aiGenerating} className="text-indigo-600 h-8 font-bold">
                                        <Sparkles size={14} className="mr-1" /> AI Suggest
                                    </Button>
                                </div>
                                {formData.requirements.map((req, i) => (
                                    <div key={i} className="flex gap-2">
                                        <Input value={req} onChange={(e) => handleFieldChange('requirements', i, e.target.value)} className="rounded-xl border-slate-200" />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveField('requirements', i)} disabled={formData.requirements.length === 1}>
                                            <Trash2 size={16} className="text-slate-400" />
                                        </Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => handleAddField('requirements')} className="w-full rounded-xl border-dashed py-5 border-slate-300">
                                    <Plus size={14} className="mr-1" /> Add Requirement
                                </Button>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <BookOpen size={18} className="text-emerald-600" />
                                        <Label className="text-sm font-bold">Learning Outcomes</Label>
                                    </div>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => generateWithAI('outcomes')} disabled={!!aiGenerating} className="text-indigo-600 h-8 font-bold">
                                        <Sparkles size={14} className="mr-1" /> AI Suggest
                                    </Button>
                                </div>
                                {formData.outcomes.map((out, i) => (
                                    <div key={i} className="flex gap-2">
                                        <Input value={out} onChange={(e) => handleFieldChange('outcomes', i, e.target.value)} className="rounded-xl border-slate-200" />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveField('outcomes', i)} disabled={formData.outcomes.length === 1}>
                                            <Trash2 size={16} className="text-slate-400" />
                                        </Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => handleAddField('outcomes')} className="w-full rounded-xl border-dashed py-5 border-slate-300">
                                    <Plus size={14} className="mr-1" /> Add Outcome
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="faqs" className="mt-0 space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <HelpCircle size={18} className="text-slate-400" />
                                <Label className="text-sm font-bold text-slate-700">Course FAQ Section</Label>
                            </div>
                            {formData.faqs.map((faq, i) => (
                                <div key={i} className="space-y-3 p-5 bg-slate-50 rounded-2xl border border-slate-200 relative group transition-all hover:bg-white hover:shadow-md">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Question</Label>
                                        <Input
                                            value={faq.question}
                                            onChange={(e) => handleFaqChange(i, 'question', e.target.value)}
                                            placeholder="e.g. Do I need any prior experience?"
                                            className="rounded-xl border-slate-200 bg-white"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Answer</Label>
                                        <Textarea
                                            value={faq.answer}
                                            onChange={(e) => handleFaqChange(i, 'answer', e.target.value)}
                                            placeholder="e.g. No, this course starts from absolute basics..."
                                            className="rounded-xl border-slate-200 bg-white min-h-[80px]"
                                        />
                                    </div>
                                    {formData.faqs.length > 1 && (
                                        <Button
                                            type="button" variant="destructive" size="icon"
                                            onClick={() => handleRemoveField('faqs', i)}
                                            className="absolute -right-2 -top-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                        >
                                            <Plus size={12} className="rotate-45" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => handleAddField('faqs')} className="w-full rounded-xl border-dashed py-5 border-slate-300">
                                <Plus size={14} className="mr-1" /> Add New FAQ
                            </Button>
                        </TabsContent>

                        <TabsContent value="pricing" className="mt-0 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Base Price (USD)</Label>
                                    <div className="relative">
                                        <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="rounded-xl pl-8 border-slate-200" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Discounted Price</Label>
                                    <div className="relative">
                                        <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <Input type="number" value={formData.discount_price || ''} onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })} className="rounded-xl pl-8 border-slate-200" placeholder="Optional" />
                                    </div>
                                </div>
                            </div>
                            <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center gap-3">
                                <input type="checkbox" id="edit-drip-c" checked={formData.drip_content} onChange={(e) => setFormData({ ...formData, drip_content: e.target.checked })} className="w-4 h-4 rounded text-indigo-600 border-indigo-300" />
                                <Label htmlFor="edit-drip-c" className="text-sm font-bold text-indigo-900 cursor-pointer">Enable Drip Content</Label>
                            </div>
                        </TabsContent>

                        <TabsContent value="media" className="mt-0 space-y-8">
                            <div className="space-y-4">
                                <Label className="text-sm font-bold text-slate-700">Course Media</Label>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="col-span-1 h-32 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-200 overflow-hidden relative group cursor-pointer" onClick={() => document.getElementById('edit-thumb-in').click()}>
                                        {formData.thumbnail ? (
                                            <img src={formData.thumbnail} alt="Current" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                                <ImageIcon size={24} />
                                                <span className="text-[10px] mt-1 uppercase font-bold">Upload</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity backdrop-blur-sm">
                                            <Plus size={24} />
                                        </div>
                                        <input id="edit-thumb-in" type="file" hidden onChange={handleThumbnailUpload} accept="image/*" />
                                    </div>
                                    <div className="col-span-2 space-y-4">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Thumbnail URL</Label>
                                            <Input value={formData.thumbnail} onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })} placeholder="https://..." className="rounded-xl border-slate-200 h-10" />
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="flex-1 space-y-1">
                                                <Label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Video Provider</Label>
                                                <Select value={formData.video_platform} onValueChange={(v) => setFormData({ ...formData, video_platform: v })}>
                                                    <SelectTrigger className="rounded-xl border-slate-200 h-10"><SelectValue /></SelectTrigger>
                                                    <SelectContent className="rounded-xl">
                                                        <SelectItem value="youtube">YouTube</SelectItem>
                                                        <SelectItem value="vimeo">Vimeo</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex-[2] space-y-1">
                                                <Label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Trailer Link</Label>
                                                <Input value={formData.preview_video} onChange={(e) => setFormData({ ...formData, preview_video: e.target.value })} placeholder="URL" className="rounded-xl border-slate-200 h-10" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-slate-100">
                                <div className="flex items-center gap-2">
                                    <Search size={18} className="text-blue-500" />
                                    <Label className="text-sm font-bold text-slate-700">Search Engine Optimization</Label>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Meta Keywords</Label>
                                    <Input value={formData.meta_keywords} onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })} placeholder="react, course, setup..." className="rounded-xl border-slate-200" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Meta Description</Label>
                                    <Textarea value={formData.meta_description} onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })} placeholder="Google snippet..." className="rounded-xl border-slate-200 min-h-[80px]" />
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>

                <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl px-6 text-slate-500 font-bold hover:bg-slate-200 transition-colors"
                    >
                        Discard Changes
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-12 h-11 font-black shadow-lg shadow-indigo-100 transition-all hover:scale-105 active:scale-95"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Syncing...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Update Course
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
