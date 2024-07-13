import { ChevronLeft, ChevronRight, Copy, CreditCard, File, ListFilter, MoreVertical, Truck } from "lucide-react";
import { NextPage } from "next";
import { Badge } from "~~/components/ui/badge";
import { Button } from "~~/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~~/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationItem } from "~~/components/ui/pagination";
import { Progress } from "~~/components/ui/progress";
import { Separator } from "~~/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~~/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~~/components/ui/tabs";

const Home: NextPage = () => {
  return (
    <>
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-4">
        {/* <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          <Card className="sm:col-span-12" x-chunk="dashboard-05-chunk-0">
            <CardHeader className="pb-3">
              <CardTitle>Fundraising Overview</CardTitle>
              <CardDescription className="max-w-lg text-balance leading-relaxed">
                Introducing Our Dynamic Orders Dashboard for Seamless Management and Insightful Analysis.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button>Create New Order</Button>
            </CardFooter>
          </Card>
        </div> */}
        <Tabs defaultValue="private">
          <div className="flex items-center">
            <TabsList>
              <TabsTrigger value="private">Private</TabsTrigger>
              <TabsTrigger value="public">Public</TabsTrigger>
              <TabsTrigger value="grant">Grant</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="private">
            <Card x-chunk="dashboard-05-chunk-3">
              <CardHeader className="px-7">
                <CardTitle>Investors</CardTitle>
                <CardDescription>The list of investors you have invited.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead className="hidden md:table-cell">Last Round</TableHead>
                      <TableHead className="hidden sm:table-cell">Ownership</TableHead>
                      <TableHead className="hidden md:table-cell">Last Invested</TableHead>
                      <TableHead className="text-right">Contracts</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="bg-accent">
                      <TableCell>
                        <div className="font-medium">Liam Johnson</div>
                        <div className="hidden text-sm text-muted-foreground md:inline">liam@capitalvc.com</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">Seed</TableCell>
                      <TableCell className="hidden sm:table-cell">4%</TableCell>
                      <TableCell className="hidden md:table-cell">2023-10-23</TableCell>
                      <TableCell className="text-right">
                        <Badge className="text-xs" variant="secondary">
                          Signed
                        </Badge>
                      </TableCell>
                    </TableRow>

                    <TableRow className="bg-accent">
                      <TableCell>
                        <div className="font-medium">Sarah Davies</div>
                        <div className="hidden text-sm text-muted-foreground md:inline">sarah@less.com</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">Seed</TableCell>
                      <TableCell className="hidden sm:table-cell">3.5%</TableCell>
                      <TableCell className="hidden md:table-cell">2023-10-23</TableCell>
                      <TableCell className="text-right">
                        <Badge className="text-xs" variant="secondary">
                          Signed
                        </Badge>
                      </TableCell>
                    </TableRow>

                    <TableRow className="bg-accent">
                      <TableCell>
                        <div className="font-medium">William Morris</div>
                        <div className="hidden text-sm text-muted-foreground md:inline">will@web3c.com</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">Seed</TableCell>
                      <TableCell className="hidden sm:table-cell">2.3%</TableCell>
                      <TableCell className="hidden md:table-cell">2023-10-23</TableCell>
                      <TableCell className="text-right">
                        <Badge className="text-xs" variant="secondary">
                          Signed
                        </Badge>
                      </TableCell>
                    </TableRow>

                    <TableRow className="bg-accent">
                      <TableCell>
                        <div className="font-medium">Jhan Kalins</div>
                        <div className="hidden text-sm text-muted-foreground md:inline">johan@exxagerated.com</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">Seed</TableCell>
                      <TableCell className="hidden sm:table-cell">1.24%</TableCell>
                      <TableCell className="hidden md:table-cell">2023-10-23</TableCell>
                      <TableCell className="text-right">
                        <Badge className="text-xs" variant="secondary">
                          Signed
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow className="bg-accent">
                      <TableCell>
                        <div className="font-medium">Mike Logan</div>
                        <div className="hidden text-sm text-muted-foreground md:inline">mike@scc.com</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">Seed</TableCell>
                      <TableCell className="hidden sm:table-cell">2.3%</TableCell>
                      <TableCell className="hidden md:table-cell">2023-10-23</TableCell>
                      <TableCell className="text-right">
                        <Badge className="text-xs" variant="secondary">
                          Signed
                        </Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <Button disabled>Invite Investor (coming soon)</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="public">
            <Card x-chunk="dashboard-05-chunk-3">
              <CardHeader className="px-7">
                <CardTitle>Crowdfunding</CardTitle>
                <CardDescription>The list of anons have invested in Acme.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Wallet</TableHead>
                      <TableHead className="hidden sm:table-cell">Ownership</TableHead>
                      <TableHead className="hidden md:table-cell">Last Invested</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="bg-accent">
                      <TableCell>
                        <div className="font-medium">0x13jd...34d9</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">0.2%</TableCell>
                      <TableCell className="hidden md:table-cell">2023-10-23</TableCell>
                    </TableRow>
                    <TableRow className="bg-accent">
                      <TableCell>
                        <div className="font-medium">0x24kc...12fa</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">0.5%</TableCell>
                      <TableCell className="hidden md:table-cell">2023-11-01</TableCell>
                    </TableRow>
                    <TableRow className="bg-accent">
                      <TableCell>
                        <div className="font-medium">0x57hd...89ab</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">0.8%</TableCell>
                      <TableCell className="hidden md:table-cell">2023-12-15</TableCell>
                    </TableRow>
                    <TableRow className="bg-accent">
                      <TableCell>
                        <div className="font-medium">0x66eg...45cd</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">1.0%</TableCell>
                      <TableCell className="hidden md:table-cell">2024-01-05</TableCell>
                    </TableRow>
                    <TableRow className="bg-accent">
                      <TableCell>
                        <div className="font-medium">0x78hf...67ef</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">1.2%</TableCell>
                      <TableCell className="hidden md:table-cell">2024-02-10</TableCell>
                    </TableRow>
                    <TableRow className="bg-accent">
                      <TableCell>
                        <div className="font-medium">0x88jd...23ba</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">1.5%</TableCell>
                      <TableCell className="hidden md:table-cell">2024-03-12</TableCell>
                    </TableRow>
                    <TableRow className="bg-accent">
                      <TableCell>
                        <div className="font-medium">0x92kl...34mn</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">1.8%</TableCell>
                      <TableCell className="hidden md:table-cell">2024-04-18</TableCell>
                    </TableRow>
                    <TableRow className="bg-accent">
                      <TableCell>
                        <div className="font-medium">0xa3jd...56op</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">2.0%</TableCell>
                      <TableCell className="hidden md:table-cell">2024-05-20</TableCell>
                    </TableRow>
                    <TableRow className="bg-accent">
                      <TableCell>
                        <div className="font-medium">0xb4kc...78qr</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">2.5%</TableCell>
                      <TableCell className="hidden md:table-cell">2024-06-25</TableCell>
                    </TableRow>
                    <TableRow className="bg-accent">
                      <TableCell>
                        <div className="font-medium">0xc5hd...89st</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">3.0%</TableCell>
                      <TableCell className="hidden md:table-cell">2024-07-28</TableCell>
                    </TableRow>
                    <TableRow className="bg-accent">
                      <TableCell>
                        <div className="font-medium">0xd6eg...90uv</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">3.5%</TableCell>
                      <TableCell className="hidden md:table-cell">2024-08-30</TableCell>
                    </TableRow>
                    <TableRow className="bg-accent">
                      <TableCell>
                        <div className="font-medium">0xe7hf...12wx</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">4.0%</TableCell>
                      <TableCell className="hidden md:table-cell">2024-09-22</TableCell>
                    </TableRow>
                    <TableRow className="bg-accent">
                      <TableCell>
                        <div className="font-medium">0xf8jd...34yz</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">4.5%</TableCell>
                      <TableCell className="hidden md:table-cell">2024-10-25</TableCell>
                    </TableRow>
                    <TableRow className="bg-accent">
                      <TableCell>
                        <div className="font-medium">0xg9kc...56ab</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">5.0%</TableCell>
                      <TableCell className="hidden md:table-cell">2024-11-27</TableCell>
                    </TableRow>
                    <TableRow className="bg-accent">
                      <TableCell>
                        <div className="font-medium">0xh1hd...78cd</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">5.5%</TableCell>
                      <TableCell className="hidden md:table-cell">2024-12-29</TableCell>
                    </TableRow>
                    <TableRow className="bg-accent">
                      <TableCell>
                        <div className="font-medium">0xj2eg...90ef</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">6.0%</TableCell>
                      <TableCell className="hidden md:table-cell">2025-01-31</TableCell>
                    </TableRow>
                    <TableRow className="bg-accent">
                      <TableCell>
                        <div className="font-medium">0xk3hf...12gh</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">6.5%</TableCell>
                      <TableCell className="hidden md:table-cell">2025-02-28</TableCell>
                    </TableRow>
                    <TableRow className="bg-accent">
                      <TableCell>
                        <div className="font-medium">0xl4jd...34ij</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">7.0%</TableCell>
                      <TableCell className="hidden md:table-cell">2025-03-30</TableCell>
                    </TableRow>
                    <TableRow className="bg-accent">
                      <TableCell>
                        <div className="font-medium">0xm5kc...56kl</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">7.5%</TableCell>
                      <TableCell className="hidden md:table-cell">2025-04-27</TableCell>
                    </TableRow>
                    <TableRow className="bg-accent">
                      <TableCell>
                        <div className="font-medium">0xn6hd...78mn</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">8.0%</TableCell>
                      <TableCell className="hidden md:table-cell">2025-05-25</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="grant">
            <Card x-chunk="dashboard-05-chunk-3">
              <CardHeader className="px-7">
                <CardTitle>Grants</CardTitle>
                <CardDescription>The list of available grants.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Protocol</TableHead>
                      <TableHead className="hidden sm:table-cell">Max amount</TableHead>
                      <TableHead className="hidden md:table-cell">Requirements</TableHead>
                      <TableHead className="hidden md:table-cell">Due Date</TableHead>
                      <TableHead className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="bg-accent">
                      <TableCell>
                        <div className="font-medium">Polygon</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">$30,000</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="text-sm text-muted-foreground">- Deploy on Polygon</div>
                        <div className="text-sm text-muted-foreground">- Use Polygon ID</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">2024-10-01</TableCell>
                      <TableCell className="text-right cursor-pointer">
                        <Badge className="text-xs" variant="default">
                          Request
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow className="bg-accent">
                      <TableCell>
                        <div className="font-medium">Arbitrum</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">$35,000</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="text-sm text-muted-foreground">- Deploy on Arbitrum</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">2024-10-01</TableCell>
                      <TableCell className="text-right cursor-pointer">
                        <Badge className="text-xs" variant="default">
                          Request
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow className="bg-accent">
                      <TableCell>
                        <div className="font-medium">Worldcoin</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">$15,000</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="text-sm text-muted-foreground">- Use Worldcoin Login</div>
                        <div className="text-sm text-muted-foreground">- Verify identity on-chain</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">2024-08-15</TableCell>
                      <TableCell className="text-right cursor-pointer">
                        <Badge className="text-xs" variant="default">
                          Request
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow className="bg-accent">
                      <TableCell>
                        <div className="font-medium">Uniswap</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">$20,000</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="text-sm text-muted-foreground">- Use pools</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">2024-05-10</TableCell>
                      <TableCell className="text-right cursor-pointer">
                        <Badge className="text-xs" variant="default">
                          Request
                        </Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Home;
