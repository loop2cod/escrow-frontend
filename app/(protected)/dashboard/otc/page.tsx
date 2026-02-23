"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { ArrowUpDown, HelpCircle, LayoutDashboard, SearchX, PlusCircle, Loader2 } from "lucide-react"
import apiClient from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

function Breadcrumb() {
    return (
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <LayoutDashboard className="h-4 w-4" />
            <span>/</span>
            <span className="text-foreground font-medium">OTC Block Trading</span>
        </nav>
    );
}

export default function OTCTradePage() {
    const router = useRouter()
    const { toast } = useToast()
    const [amount, setAmount] = useState("")
    const [fromAsset, setFromAsset] = useState("BTC")
    const [toAsset, setToAsset] = useState("USDT")
    const [settlementMethod, setSettlementMethod] = useState("realtime")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [quotes, setQuotes] = useState<any[]>([])
    const [loadingQuotes, setLoadingQuotes] = useState(true)

    const fetchQuotes = async () => {
        try {
            const res = await apiClient.get('/otc/quote/history');
            if (res.data.success) {
                setQuotes(res.data.history);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingQuotes(false);
        }
    };

    useEffect(() => {
        fetchQuotes();
    }, []);

    // The available coins for select
    const coins = [
        { id: "BTC", name: "BTC", icon: "/coin-icons/bitcoin-btc-logo.png" },
        { id: "ETH", name: "ETH", icon: "/coin-icons/ethereum-eth-logo.png" },
        { id: "SOL", name: "SOL", icon: "/coin-icons/solana-sol-logo.png" },
        { id: "USDT", name: "USDT", icon: "/coin-icons/tether-usdt-logo.png" },
        { id: "TRX", name: "TRX", icon: "/coin-icons/tron-trx-logo.png" },
        { id: "AED", name: "AED", icon: "/coin-icons/AED.png" },
    ];

    const handleSwap = () => {
        setFromAsset(toAsset);
        setToAsset(fromAsset);
    }

    const handleRequestQuote = async () => {
        if (!amount || parseFloat(amount) <= 0) return;

        setIsSubmitting(true);
        try {
            const response = await apiClient.post('/otc/quote', {
                amount: parseFloat(amount),
                currency: fromAsset,
                targetAsset: toAsset,
            });

            if (response.data.success) {
                toast({
                    title: "Quote Requested",
                    description: `Successfully requested OTC quote for ${amount} ${fromAsset}.`,
                });
                setAmount("");
                fetchQuotes();
            } else {
                toast({
                    variant: "destructive",
                    title: "Request Failed",
                    description: response.data.error || "Failed to create quote request.",
                });
            }
        } catch (error: any) {
            console.error("Error creating quote:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error?.response?.data?.error || "An unexpected error occurred. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Breadcrumb */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <Breadcrumb />
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Marketplace</h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                        Request anonymous quotes for large volume trades securely directly from Liquidity Providers.
                    </p>
                </div>
            </div>

            {/* MAIN GRID SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

                {/* LEFT COLUMN: SWAP FORM */}
                <Card className="border-0 shadow-lg bg-linear-to-br from-card to-muted/20 flex flex-col h-full min-h-[520px]">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Trade Request</CardTitle>
                        <CardDescription>Determine the assets and quantity you wish to trade.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">

                        {/* UNIFIED SWAP WIDGET (OKX STYLE) */}
                        <div className="flex flex-col gap-4 mb-6">

                            {/* TOP ASSET SELECTION ROW */}
                            <div className="flex items-center gap-2 relative">
                                {/* FROM ASSET */}
                                <div className="flex-1 bg-muted/20 p-4 sm:p-5 rounded-xl border border-border/50 hover:border-primary/30 transition-colors shadow-sm focus-within:border-primary/50">
                                    <div className="text-sm text-muted-foreground font-medium mb-3">From</div>
                                    <Select value={fromAsset} onValueChange={setFromAsset}>
                                        <SelectTrigger className="w-fit border-0 bg-transparent shadow-none p-0 h-auto gap-3 text-lg sm:text-xl font-bold focus:ring-0 [&>svg]:opacity-100">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {coins.map(coin => (
                                                <SelectItem key={coin.id} value={coin.id} className="cursor-pointer py-2">
                                                    <div className="flex items-center gap-3">
                                                        <img src={coin.icon} className="w-5 h-5 rounded-full" alt={coin.name} />
                                                        <span className="font-semibold">{coin.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* SWAP ARROW CENTERED */}
                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="rounded-full shadow-md bg-background border-border hover:bg-accent hover:border-primary/50 h-10 w-10 sm:h-11 sm:w-11 transition-all"
                                        onClick={handleSwap}
                                    >
                                        <ArrowUpDown className="w-4 h-4 sm:w-5 sm:h-5 text-foreground rotate-90" />
                                    </Button>
                                </div>

                                {/* TO ASSET */}
                                <div className="flex-1 bg-muted/20 p-4 sm:p-5 rounded-xl border border-border/50 hover:border-primary/30 transition-colors shadow-sm flex flex-col items-end">
                                    <div className="text-sm text-muted-foreground font-medium mb-3 w-full text-right">To</div>
                                    <Select value={toAsset} onValueChange={setToAsset}>
                                        <SelectTrigger className="w-fit border-0 bg-transparent shadow-none p-0 h-auto gap-3 text-lg sm:text-xl font-bold focus:ring-0 [&>svg]:opacity-100 flex-row-reverse" dir="rtl">
                                            <span dir="ltr"><SelectValue /></span>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {coins.map(coin => (
                                                <SelectItem key={coin.id} value={coin.id} className="cursor-pointer py-2">
                                                    <div className="flex items-center gap-3">
                                                        <img src={coin.icon} className="w-5 h-5 rounded-full" alt={coin.name} />
                                                        <span className="font-semibold">{coin.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* AMOUNT PAID BOX */}
                            <div className="bg-muted/10 p-4 sm:p-5 rounded-xl border border-border/50 shadow-sm transition-all mt-1">
                                <div className="text-sm font-semibold text-foreground/80 mb-3">Amount paid</div>
                                <div className="flex items-center justify-between gap-4 mb-3">
                                    <div className="flex items-baseline gap-2 flex-1">
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="bg-transparent border-0 text-base sm:text-lg  outline-none focus:outline-none focus:ring-0 focus:border-0 focus-visible:ring-0 focus-visible:outline-none w-full p-0 placeholder:text-muted-foreground/30 text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                        <span className="text-base sm:text-lg text-muted-foreground/40 font-medium whitespace-nowrap hidden sm:block">
                                            ~ 0.00
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 border-l border-border/50 pl-4">
                                        <span className="font-bold text-lg">{fromAsset}</span>
                                        <button className="text-primary font-semibold hover:text-primary/80 transition-colors text-sm">All</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SETTLEMENT METHOD */}
                        <div className="space-y-3 pt-4 flex-1">
                            <Label className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm font-medium">
                                Settlement Method <HelpCircle className="w-3.5 h-3.5" />
                            </Label>
                            <RadioGroup value={settlementMethod} onValueChange={setSettlementMethod} className="flex gap-6 mt-3">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="realtime" id="realtime" />
                                    <Label htmlFor="realtime" className="cursor-pointer text-sm">Real-Time</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="delayed" id="delayed" />
                                    <Label htmlFor="delayed" className="text-muted-foreground cursor-pointer text-sm">Delayed</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                        <Button
                            className="w-full"
                            disabled={!amount || isSubmitting}
                            size="lg"
                            onClick={handleRequestQuote}
                        >
                            {isSubmitting ? 'Requesting...' : amount ? 'Request Quote' : 'Enter Quantity'}
                        </Button>
                    </CardFooter>
                </Card>

                {/* RIGHT COLUMN: RECENT HISTORY TABS */}
                <Card className="border-border shadow-sm bg-card flex flex-col h-full min-h-[520px] gap-0">
                    <div className="border-b border-border/50 px-6 py-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold tracking-tight text-foreground">Recent Activity</h2>
                    </div>
                    <CardContent className="p-0 flex-1 flex flex-col">
                        <Tabs defaultValue="inquiry" className="w-full h-full flex flex-col">
                            <div className="px-6 pt-3 pb-0 border-b border-border/40">
                                <TabsList className="bg-transparent p-0 h-auto justify-start gap-8 border-0 w-full">
                                    <TabsTrigger
                                        value="inquiry"
                                    >
                                        Inquiry Record
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="history"
                                    >
                                        Order History
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="inquiry" className="p-0 flex-1 flex flex-col outline-none mt-0">
                                <div className="px-6 py-4 flex items-center gap-2 text-sm font-medium w-full border-b border-border/40">
                                    <Button variant="secondary" size="sm" className="bg-muted text-foreground hover:bg-muted/80 h-8 px-4 rounded-full text-xs">
                                        Pending ({quotes.filter(q => q.status === 'PENDING').length})
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-8 px-4 rounded-full text-xs">
                                        Settling (0)
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-8 px-4 rounded-full text-xs">
                                        Expired
                                    </Button>
                                </div>

                                {loadingQuotes ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/50 py-16 m-6">
                                        <Loader2 className="w-10 h-10 mb-4 opacity-30 stroke-1 animate-spin" />
                                        <p className="text-sm font-medium">Loading history...</p>
                                    </div>
                                ) : quotes.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/50 py-16 m-6">
                                        <SearchX className="w-10 h-10 mb-4 opacity-30 stroke-1" />
                                        <p className="text-sm font-medium">No records found.</p>
                                    </div>
                                ) : (
                                    <div className="px-6 pb-6 overflow-y-auto no-scrollbar max-h-[400px]">
                                        <div className="space-y-3 mt-4">
                                            {quotes.map((q) => (
                                                <div key={q.id} className="p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/20 transition-colors flex items-center justify-between">
                                                    {/* TODO: Implement quote history */}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="history" className="p-0 flex-1 flex flex-col outline-none mt-0">
                                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/50 py-16 m-6">
                                    <SearchX className="w-10 h-10 mb-4 opacity-30 stroke-1" />
                                    <p className="text-sm font-medium">No history records found.</p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}
