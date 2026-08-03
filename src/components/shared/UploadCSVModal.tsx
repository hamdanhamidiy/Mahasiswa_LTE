'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2,
  X, ArrowRight, FileText, ChevronRight, Info, MapPin,
} from 'lucide-react';
import {
  type TargetField, type ParsedCSV,
  parseCSV, readFileAsText, autoMatchColumns, applyMapping,
} from '@/lib/import';

interface UploadCSVModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  targetFields: TargetField[];
  onImport: (data: Record<string, string>[]) => Promise<{ success: number; failed: number; errors?: string[] }>;
}

type Step = 'upload' | 'mapping' | 'preview' | 'importing' | 'result';

export function UploadCSVModal({
  open, onOpenChange, title, description, targetFields, onImport,
}: UploadCSVModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('upload');
  const [csv, setCsv] = useState<ParsedCSV | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [mappedData, setMappedData] = useState<Record<string, string>[]>([]);
  const [result, setResult] = useState<{ success: number; failed: number; errors?: string[] } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep('upload');
        setCsv(null);
        setMapping({});
        setMappedData([]);
        setResult(null);
      }, 300);
    }
  }, [open]);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.match(/\.(csv|txt|tsv)$/i)) {
      alert('File harus berformat .csv, .txt, atau .tsv');
      return;
    }
    try {
      const text = await readFileAsText(file);
      const parsed = parseCSV(text);
      if (parsed.headers.length === 0 || parsed.rows.length === 0) {
        alert('File CSV kosong atau format tidak valid');
        return;
      }
      setCsv(parsed);
      const autoMap = autoMatchColumns(parsed.headers, targetFields);
      setMapping(autoMap);
      setStep('mapping');
    } catch (err: any) {
      alert('Gagal membaca file: ' + (err.message || 'Unknown error'));
    }
  }, [targetFields]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const updateMapping = (targetKey: string, csvHeader: string) => {
    setMapping(prev => ({ ...prev, [targetKey]: csvHeader }));
  };

  const requiredMissing = targetFields
    .filter(f => f.required && !mapping[f.key])
    .map(f => f.label);

  const handleProceedToPreview = () => {
    if (!csv) return;
    const data = applyMapping(csv.rows, mapping, targetFields);
    setMappedData(data);
    setStep('preview');
  };

  const handleStartImport = async () => {
    setStep('importing');
    try {
      const res = await onImport(mappedData);
      setResult(res);
      setStep('result');
    } catch (err: any) {
      setResult({ success: 0, failed: mappedData.length, errors: [err.message || 'Unknown error'] });
      setStep('result');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-primary" />
            {title}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">{description}</p>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-2">
          {(['Upload File', 'Pencocokan Kolom', 'Preview Data', 'Hasil'] as const).map((label, i) => {
            const stepOrder: Step[] = ['upload', 'mapping', 'preview', 'result'];
            const currentIdx = stepOrder.indexOf(step === 'importing' ? 'result' : step);
            const isActive = i <= currentIdx;
            return (
              <span key={label} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3 h-3" />}
                <span className={`px-2 py-0.5 rounded-md font-medium ${isActive ? 'bg-primary/10 text-primary' : 'bg-muted/40 text-muted-foreground/50'}`}>
                  {label}
                </span>
              </span>
            );
          })}
        </div>

        {/* ====== STEP 1: UPLOAD ====== */}
        {step === 'upload' && (
          <div className="space-y-4">
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.txt,.tsv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <div
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-primary bg-primary/[0.03] scale-[1.01]'
                  : 'border-border hover:border-primary/40 hover:bg-primary/[0.01]'
              }`}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm font-medium text-muted-foreground">
                Klik atau seret file CSV ke sini
              </p>
              <p className="text-xs text-muted-foreground/50 mt-1">
                Format: CSV, TSV, TXT • Nama kolom bebas, nanti bisa dicocokkan
              </p>
            </div>

            {/* Info: required fields */}
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5 mb-2">
                <Info className="w-3.5 h-3.5" /> Kolom yang dibutuhkan:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {targetFields.map(f => (
                  <Badge key={f.key} variant="outline" className={`text-[10px] ${f.required ? 'border-primary/30 text-primary' : 'text-muted-foreground'}`}>
                    {f.label} {f.required && <span className="text-error ml-0.5">*</span>}
                    {!f.required && f.defaultValue && <span className="ml-1 opacity-50">({f.defaultValue})</span>}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ====== STEP 2: MAPPING ====== */}
        {step === 'mapping' && csv && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-primary/[0.03] border border-primary/10">
              <p className="text-xs text-primary font-medium flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                File berhasil dibaca: {csv.rows.length} baris data, {csv.headers.length} kolom
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              Cocokkan kolom dari file Anda dengan kolom yang dibutuhkan sistem. Kolom wajib ditandai <span className="text-error font-bold">*</span>.
            </p>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {targetFields.map(field => {
                const matched = mapping[field.key];
                return (
                  <div key={field.key} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/20 border border-border/50">
                    {/* Target side */}
                    <div className="w-[160px] shrink-0">
                      <p className="text-xs font-medium">
                        {field.label} {field.required && <span className="text-error">*</span>}
                      </p>
                      {!field.required && field.defaultValue && (
                        <p className="text-[9px] text-muted-foreground">Default: {field.defaultValue}</p>
                      )}
                    </div>

                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0" />

                    {/* CSV header dropdown */}
                    <Select value={matched || '__none__'} onValueChange={(v) => updateMapping(field.key, v === '__none__' ? '' : (v || ''))}>
                      <SelectTrigger className={`h-8 text-xs flex-1 ${matched ? 'border-success/30' : field.required ? 'border-error/30' : ''}`}>
                        <SelectValue placeholder="— Pilih kolom —" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__" className="text-xs text-muted-foreground">— Tidak dicocokkan —</SelectItem>
                        {csv.headers.map(h => (
                          <SelectItem key={h} value={h} className="text-xs">{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Match indicator */}
                    {matched ? (
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                    ) : field.required ? (
                      <AlertCircle className="w-4 h-4 text-error shrink-0" />
                    ) : (
                      <div className="w-4 h-4 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            {requiredMissing.length > 0 && (
              <p className="text-[11px] text-error flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Kolom wajib belum dicocokkan: {requiredMissing.join(', ')}
              </p>
            )}

            <div className="flex justify-between items-center pt-2">
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setStep('upload')}>
                <X className="w-3 h-3 mr-1" /> Ganti File
              </Button>
              <Button
                size="sm"
                className="bg-primary text-xs"
                disabled={requiredMissing.length > 0}
                onClick={handleProceedToPreview}
              >
                Lanjut Preview <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ====== STEP 3: PREVIEW ====== */}
        {step === 'preview' && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Berikut {Math.min(mappedData.length, 5)} baris pertama data yang akan diimpor. Pastikan datanya sudah benar.
            </p>

            <div className="overflow-x-auto border border-border rounded-lg max-h-[280px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="text-[10px] w-8">#</TableHead>
                    {targetFields.filter(f => mapping[f.key] || f.defaultValue).map(f => (
                      <TableHead key={f.key} className="text-[10px]">{f.label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappedData.slice(0, 5).map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-[11px] text-muted-foreground">{i + 1}</TableCell>
                      {targetFields.filter(f => mapping[f.key] || f.defaultValue).map(f => (
                        <TableCell key={f.key} className="text-[11px]">
                          {row[f.key] || <span className="text-muted-foreground/30">—</span>}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <p className="text-xs text-muted-foreground">
                Total data: <span className="font-bold text-foreground">{mappedData.length} baris</span> akan diimpor ke database.
              </p>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setStep('mapping')}>
                Kembali
              </Button>
              <Button size="sm" className="bg-primary text-xs" onClick={handleStartImport}>
                <Upload className="w-3 h-3 mr-1.5" /> Impor {mappedData.length} Data
              </Button>
            </div>
          </div>
        )}

        {/* ====== STEP 4: IMPORTING ====== */}
        {step === 'importing' && (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-sm font-medium">Mengimpor {mappedData.length} data...</p>
            <p className="text-xs text-muted-foreground">Mohon tunggu, jangan tutup jendela ini</p>
          </div>
        )}

        {/* ====== STEP 5: RESULT ====== */}
        {step === 'result' && result && (
          <div className="space-y-4">
            <div className={`p-5 rounded-xl border text-center ${
              result.failed === 0
                ? 'bg-success/5 border-success/20'
                : result.success === 0
                  ? 'bg-error/5 border-error/20'
                  : 'bg-warning/5 border-warning/20'
            }`}>
              {result.failed === 0 ? (
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-success" />
              ) : (
                <AlertCircle className="w-10 h-10 mx-auto mb-2 text-warning" />
              )}
              <p className="text-lg font-bold">
                {result.success} Berhasil
                {result.failed > 0 && <span className="text-error"> • {result.failed} Gagal</span>}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Dari total {result.success + result.failed} data yang diproses
              </p>
            </div>

            {/* Error details */}
            {result.errors && result.errors.length > 0 && (
              <div className="p-3 rounded-lg bg-error/5 border border-error/10 max-h-[150px] overflow-y-auto">
                <p className="text-[10px] font-semibold text-error mb-1.5">Detail error:</p>
                {result.errors.slice(0, 10).map((err, i) => (
                  <p key={i} className="text-[10px] text-error/70">• {err}</p>
                ))}
                {result.errors.length > 10 && (
                  <p className="text-[10px] text-error/50 mt-1">...dan {result.errors.length - 10} error lainnya</p>
                )}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button size="sm" className="bg-primary text-xs" onClick={() => onOpenChange(false)}>
                Selesai
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
