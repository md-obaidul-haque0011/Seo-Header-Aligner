"use client";

import { useState, useTransition } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getHtmlFromUrl, getOptimizedHeaders, getRankingPotential } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import type { AnalyzeSeoHeadersOutput } from "@/ai/schemas/analyze-seo-headers-schema";
import type { EstimateRankingPotentialOutput } from "@/ai/schemas/estimate-ranking-potential-schema";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Logo } from "@/components/logo";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, XCircle, AlertTriangle, Info, ShieldAlert } from "lucide-react";
import ReactMarkdown from "react-markdown";

import {
  Download,
  Link2,
  FileCode2,
  LoaderCircle,
  Sparkles,
  Search,
  ClipboardList,
} from "lucide-react";

const headerAlignerSchema = z.object({
  inputType: z.enum(["url", "html"]),
  url: z.string().optional(),
  html: z.string().optional(),
}).refine(data => {
    if (data.inputType === 'url') return !!data.url && data.url.trim().length > 0;
    if (data.inputType === 'html') return !!data.html && data.html.trim().length > 0;
    return false;
}, {
    message: "Please provide either a URL or HTML content.",
    path: ["url"], 
});

const rankingEstimatorSchema = z.object({
  headerType: z.string().min(1, "Header type is required."),
  headerText: z.string().min(1, "Header text is required."),
  mainKeyword: z.string().min(1, "Main keyword is required."),
});

type HeaderAlignerValues = z.infer<typeof headerAlignerSchema>;
type RankingEstimatorValues = z.infer<typeof rankingEstimatorSchema>;

const severityIcons = {
  "Critical": <AlertTriangle className="h-5 w-5 text-destructive" />,
  "Warning": <ShieldAlert className="h-5 w-5 text-yellow-500" />,
  "Info": <Info className="h-5 w-5 text-blue-500" />,
};

const severityColors: { [key: string]: string } = {
  "Critical": "bg-destructive/10 border-destructive/50",
  "Warning": "bg-yellow-500/10 border-yellow-500/50",
  "Info": "bg-blue-500/10 border-blue-500/50",
};


export default function SeoHeaderAligner() {
  const [activeTab, setActiveTab] = useState("aligner");
  
  const [isAlignerPending, startAlignerTransition] = useTransition();
  const [isRankingPending, startRankingTransition] = useTransition();
  const { toast } = useToast();

  // State for Header Aligner
  const [analysisResult, setAnalysisResult] = useState<AnalyzeSeoHeadersOutput | null>(null);
  const [alignerError, setAlignerError] = useState<string | null>(null);

  // State for Ranking Estimator
  const [rankingResult, setRankingResult] = useState<EstimateRankingPotentialOutput | null>(null);
  const [rankingError, setRankingError] = useState<string | null>(null);

  const alignerForm = useForm<HeaderAlignerValues>({
    resolver: zodResolver(headerAlignerSchema),
    defaultValues: {
      inputType: "url",
      url: "",
      html: "",
    },
  });

  const rankingForm = useForm<RankingEstimatorValues>({
    resolver: zodResolver(rankingEstimatorSchema),
    defaultValues: {
      headerType: "H1",
      headerText: "",
      mainKeyword: ""
    }
  });

  const onAlignerSubmit: SubmitHandler<HeaderAlignerValues> = (data) => {
    setAlignerError(null);
    setAnalysisResult(null);

    startAlignerTransition(async () => {
      let currentHtml = "";
      if (data.inputType === "url" && data.url) {
        const urlResult = await getHtmlFromUrl(data.url);
        if (!urlResult.success) {
          setAlignerError(urlResult.error);
          toast({ variant: "destructive", title: "Error", description: urlResult.error });
          return;
        }
        currentHtml = urlResult.html;
      } else if (data.inputType === "html" && data.html) {
        currentHtml = data.html;
      } else {
        const errorMessage = "Please provide a valid URL or HTML content.";
        setAlignerError(errorMessage);
        toast({ variant: "destructive", title: "Error", description: errorMessage });
        return;
      }

      const aiResult = await getOptimizedHeaders(currentHtml);
      if (!aiResult.success) {
        setAlignerError(aiResult.error);
        toast({ variant: "destructive", title: "Error", description: aiResult.error });
        return;
      }
      setAnalysisResult(aiResult.data);
    });
  };

  const onRankingSubmit: SubmitHandler<RankingEstimatorValues> = (data) => {
    setRankingError(null);
    setRankingResult(null);

    startRankingTransition(async () => {
      const result = await getRankingPotential(data);
      if (result.success) {
        setRankingResult(result.data);
      } else {
        setRankingError(result.error);
        toast({ variant: "destructive", title: "Error", description: result.error });
      }
    });
  }

  const handleDownload = () => {
    if (!analysisResult?.optimizedHtml) return;
    const blob = new Blob([analysisResult.optimizedHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "optimized-headers.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Success", description: "Optimized HTML downloaded." });
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-destructive";
  }

  return (
    <div className="container mx-auto max-w-7xl p-4 sm:p-6 md:p-8">
      <header className="flex flex-col items-center text-center mb-8 animate-fade-in">
        <Logo />
        <h1 className="text-4xl font-bold tracking-tight text-primary mt-4">
          SEO Header Aligner
        </h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
          Use our AI tools to optimize your headers for SEO and estimate their ranking potential.
        </p>
      </header>

      <main className="animate-fade-in-up">
        <Tabs defaultValue="aligner" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="aligner"><Sparkles className="mr-2" /> Header Optimizer</TabsTrigger>
            <TabsTrigger value="estimator"><Search className="mr-2" /> Ranking Estimator</TabsTrigger>
          </TabsList>
          
          {/* Header Optimizer Tab */}
          <TabsContent value="aligner">
            <form onSubmit={alignerForm.handleSubmit(onAlignerSubmit)}>
              <Tabs
                defaultValue="url"
                className="w-full"
                onValueChange={(value) => alignerForm.setValue("inputType", value as "url" | "html")}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="url"><Link2 className="mr-2" /> From URL</TabsTrigger>
                  <TabsTrigger value="html"><FileCode2 className="mr-2" /> Paste HTML</TabsTrigger>
                </TabsList>
                <TabsContent value="url">
                  <Card>
                    <CardContent className="p-6">
                      <Input placeholder="https://example.com" {...alignerForm.register("url")} />
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="html">
                  <Card>
                    <CardContent className="p-6">
                      <Textarea
                        placeholder="<html>...</html>"
                        className="min-h-[200px] font-mono"
                        {...alignerForm.register("html")}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              {(alignerForm.formState.errors.url || alignerForm.formState.errors.html) && (
                  <p className="text-sm font-medium text-destructive mt-2 text-center">
                    {alignerForm.formState.errors.url?.message || alignerForm.formState.errors.html?.message}
                  </p>
                )}
              <div className="mt-6 flex justify-center">
                <Button type="submit" size="lg" disabled={isAlignerPending}>
                  {isAlignerPending ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    <Sparkles className="mr-2" />
                  )}
                  Analyze Headers
                </Button>
              </div>
            </form>

            <section className="mt-12">
              {isAlignerPending && (
                <div className="space-y-6">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
              )}
              {alignerError && !isAlignerPending && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Analysis Failed</AlertTitle>
                  <AlertDescription>{alignerError}</AlertDescription>
                </Alert>
              )}
              {analysisResult && !isAlignerPending && (
                <div className="animate-fade-in space-y-8">
                   <Card>
                      <CardHeader>
                          <CardTitle>Analysis Report</CardTitle>
                          <CardDescription>A complete analysis of your page's header structure.</CardDescription>
                      </CardHeader>
                      <CardContent className="grid md:grid-cols-3 gap-6">
                           <div className="flex flex-col items-center justify-center space-y-2">
                               <div className="relative h-32 w-32">
                                  <svg className="absolute inset-0" viewBox="0 0 36 36">
                                      <path className="text-muted/50" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                                      <path className={getScoreColor(analysisResult.seoScore)} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${analysisResult.seoScore}, 100`} strokeLinecap="round" transform="rotate(-90 18 18)"></path>
                                  </svg>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                      <span className={`text-4xl font-bold ${getScoreColor(analysisResult.seoScore)}`}>{analysisResult.seoScore}</span>
                                  </div>
                               </div>
                               <p className="text-lg font-medium text-muted-foreground">Overall SEO Score</p>
                           </div>
                           <Card className="md:col-span-2">
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2"><ClipboardList/> Detected Headers</CardTitle>
                              </CardHeader>
                              <CardContent>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="w-[100px]">Tag</TableHead>
                                        <TableHead>Content</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {analysisResult.detectedHeaders.map((h, i) => (
                                        <TableRow key={i}>
                                          <TableCell><Badge variant="secondary">{h.tag}</Badge></TableCell>
                                          <TableCell>{h.content}</TableCell>
                                        </TableRow>
                                      ))}
                                      {analysisResult.detectedHeaders.length === 0 && <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">No headers found.</TableCell></TableRow>}
                                    </TableBody>
                                  </Table>
                              </CardContent>
                           </Card>
                      </CardContent>
                   </Card>
                   
                   <Card>
                      <CardHeader>
                        <CardTitle>Issues & Recommendations</CardTitle>
                        <CardDescription>Actionable advice to improve your header SEO.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          {analysisResult.analysis.length > 0 ? (
                              <Accordion type="single" collapsible className="w-full">
                                  {analysisResult.analysis.map((item, index) => (
                                      <AccordionItem key={index} value={`item-${index}`} className={`rounded-lg mb-2 px-4 border ${severityColors[item.severity]}`}>
                                          <AccordionTrigger className="hover:no-underline">
                                              <div className="flex items-center gap-3">
                                                  {severityIcons[item.severity as keyof typeof severityIcons]}
                                                  <span className="font-semibold">{item.message}</span>
                                              </div>
                                          </AccordionTrigger>
                                          <AccordionContent>
                                              <p className="text-muted-foreground">{item.recommendation}</p>
                                          </AccordionContent>
                                      </AccordionItem>
                                  ))}
                              </Accordion>
                          ) : (
                              <div className="flex flex-col items-center justify-center text-center p-8 bg-muted/50 rounded-lg">
                                <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                                <h3 className="text-xl font-semibold">Great job!</h3>
                                <p className="text-muted-foreground">No critical SEO issues found in your headers.</p>
                              </div>
                          )}
                      </CardContent>
                   </Card>

                  <div className="flex justify-end mb-4">
                    <Button onClick={handleDownload} variant="secondary">
                      <Download className="mr-2" />
                      Download Optimized HTML
                    </Button>
                  </div>

                  <Card className="border-primary/50 shadow-lg shadow-primary/10">
                    <CardHeader><CardTitle className="flex items-center text-primary"><Sparkles className="mr-2 text-accent"/> Optimized HTML</CardTitle></CardHeader>
                    <CardContent><pre className="bg-primary/5 p-4 rounded-lg text-sm overflow-auto max-h-[600px]"><code>{analysisResult.optimizedHtml}</code></pre></CardContent>
                  </Card>
                </div>
              )}
            </section>
          </TabsContent>

          {/* Ranking Estimator Tab */}
          <TabsContent value="estimator">
            <Card>
              <CardContent className="p-6">
                <form onSubmit={rankingForm.handleSubmit(onRankingSubmit)} className="space-y-4">
                   <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="headerType" className="text-sm font-medium">Header Type</label>
                        <Input id="headerType" placeholder="e.g., H1, Title Tag" {...rankingForm.register("headerType")} />
                        {rankingForm.formState.errors.headerType && <p className="text-sm font-medium text-destructive mt-1">{rankingForm.formState.errors.headerType.message}</p>}
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="headerText" className="text-sm font-medium">Header Text</label>
                        <Input id="headerText" placeholder="Your header content" {...rankingForm.register("headerText")} />
                         {rankingForm.formState.errors.headerText && <p className="text-sm font-medium text-destructive mt-1">{rankingForm.formState.errors.headerText.message}</p>}
                      </div>
                   </div>
                   <div>
                      <label htmlFor="mainKeyword" className="text-sm font-medium">Main Keyword</label>
                      <Input id="mainKeyword" placeholder="Your target keyword" {...rankingForm.register("mainKeyword")} />
                      {rankingForm.formState.errors.mainKeyword && <p className="text-sm font-medium text-destructive mt-1">{rankingForm.formState.errors.mainKeyword.message}</p>}
                   </div>
                   <div className="flex justify-center pt-2">
                      <Button type="submit" size="lg" disabled={isRankingPending}>
                        {isRankingPending ? <LoaderCircle className="animate-spin" /> : <Search className="mr-2" />}
                        Estimate Potential
                      </Button>
                   </div>
                </form>
              </CardContent>
            </Card>

            <section className="mt-8">
                {isRankingPending && <div className="space-y-4">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-40 w-full" />
                </div>}

                {rankingError && !isRankingPending && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Estimation Failed</AlertTitle>
                        <AlertDescription>{rankingError}</AlertDescription>
                    </Alert>
                )}

                {rankingResult && !isRankingPending && (
                    <div className="space-y-8 animate-fade-in">
                        <Card>
                            <CardHeader>
                                <CardTitle>Ranking Potential: <span className="text-primary">{rankingResult.estimatedRankingCategory}</span></CardTitle>
                                <CardDescription>Score: {rankingResult.rankingPotentialScore} / 100</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Progress value={rankingResult.rankingPotentialScore} className="w-full" />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>Analysis Report</CardTitle></CardHeader>
                            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                                <ReactMarkdown components={{ a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" /> }}>
                                    {rankingResult.rankingAnalysisReport}
                                </ReactMarkdown>
                            </CardContent>
                        </Card>

                        <div className="grid md:grid-cols-2 gap-8">
                            <Card>
                                <CardHeader><CardTitle>Keyword Variations</CardTitle></CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Keyword</TableHead>
                                                <TableHead>Volume</TableHead>
                                                <TableHead>KD</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {rankingResult.keywordVariations.map((v, i) => (
                                                <TableRow key={i}>
                                                    <TableCell>{v.keyword}</TableCell>
                                                    <TableCell>{v.volume}</TableCell>
                                                    <TableCell><Badge variant="outline">{v.kd}</Badge></TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle>Audit Checklist</CardTitle></CardHeader>
                                <CardContent>
                                    <ul className="space-y-3">
                                        {rankingResult.auditChecklistResults.map((item, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <div>
                                                    {item.isMet ? <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" /> : <XCircle className="h-5 w-5 text-destructive mt-0.5" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium">{item.checklistItem}</p>
                                                     <div className="text-sm text-muted-foreground prose prose-sm max-w-none dark:prose-invert">
                                                        <ReactMarkdown components={{ a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" /> }}>
                                                          {item.reasoning}
                                                        </ReactMarkdown>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>

                    </div>
                )}
            </section>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
