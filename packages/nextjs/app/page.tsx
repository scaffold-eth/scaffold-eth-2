"use client";

import { TrendingUp } from "lucide-react";
import { NextPage } from "next";
import { Bar, BarChart, LabelList, XAxis } from "recharts";
import { Pie, PieChart } from "recharts";
import { Badge } from "~~/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~~/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "~~/components/ui/chart";
import { Progress } from "~~/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~~/components/ui/table";

const holdingsChartData = [
  { token: "USDC", value: 100000, fill: "#F4B678" },
  { token: "DAI", value: 100000, fill: "#EF9234" },
  { token: "BUIDL", value: 400000, fill: "#EC7A08" },
  { token: "FOBXX", value: 400000, fill: "#C46100" },
  { token: "XEVT", value: 200000, fill: "#8F4700" },
];
const capChartData = [
  { type: "founders", percentage: 100000, fill: "#8BC1F7" },
  { type: "investors", percentage: 100000, fill: "#519DE9" },
  { type: "team", percentage: 400000, fill: "#06C" },
  { type: "advisors", percentage: 400000, fill: "#004B95" },
  { type: "other", percentage: 200000, fill: "#002F5D" },
];

const holdingsChartConfig = {
  USDC: {
    label: "USDC",
  },
  DAI: {
    label: "DAI",
    color: "hsl(var(--chart-1))",
  },
  BUIDL: {
    label: "Blackrock US Equity",
    color: "hsl(var(--chart-2))",
  },
  FOBXX: {
    label: "Franklin US Bond",
    color: "hsl(var(--chart-3))",
  },
  XEVT: {
    label: "OpenTrade EU Bonds",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

const capChartConfig = {
  founders: {
    label: "Founders",
  },
  investors: {
    label: "Investors",
    color: "hsl(var(--chart-1))",
  },
  team: {
    label: "Team Members",
    color: "hsl(var(--chart-2))",
  },
  advisors: {
    label: "Advisors",
    color: "hsl(var(--chart-3))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

const fundraisingChartData = [
  { round: "Pre-Seed", size: 1000000, valuation: 8000000 },
  { round: "Seed", size: 12000000, valuation: 45000000 },
  { round: "Series A", size: 50000000, valuation: 200000000 },
];

const fundraisingChartConfig = {
  size: {
    label: "Size",
    color: "#2563eb",
  },
  valuation: {
    label: "Valuation",
    color: "#60a5fa",
  },
} satisfies ChartConfig;

const Home: NextPage = () => {
  return (
    <>
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-4">
        <div className="grid gap-4 sm:grid-cols-5">
          <Card className="md:col-span-2" x-chunk="dashboard-05-chunk-0">
            <CardHeader className="pb-3">
              <CardTitle>Acme Protocol</CardTitle>
              <CardDescription className="max-w-lg text-balance leading-relaxed">
                You are thriving! In the last 3 months the TVL has increased by 25%. The payroll has increased by 10%,
                including one new team member. The public fundraise is on track to reach its goal at current pace. All
                the private investors has signed the term sheet.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card x-chunk="dashboard-05-chunk-1 sm:col-span-1">
            <CardHeader className="pb-2">
              <CardDescription>TVL</CardDescription>
              <CardTitle className="text-4xl">$31M</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">+25% in the last 3 months</div>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-05-chunk-2 sm:col-span-1">
            <CardHeader className="pb-2">
              <CardDescription>Holdings</CardDescription>
              <CardTitle className="text-4xl">$1.2M</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">-2% from last month</div>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-05-chunk-2 sm:col-span-1">
            <CardHeader className="pb-2">
              <CardDescription>Next Payroll</CardDescription>
              <CardTitle className="text-4xl">$153k</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">July 27th</div>
            </CardContent>
          </Card>
        </div>
        <div className="grid sm:grid-cols-5 gap-4">
          <div className="md:col-span-2 h-full min-h-full ">
            <Card x-chunk="dashboard-05-chunk-3 min-h-full h-full sm:col-span-2">
              <CardHeader className="px-7">
                <CardTitle>Fundraising</CardTitle>
                <CardDescription>
                  <div className="text-sm">An overview of your fundraising status across all sources.</div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {" "}
                <div className="text-md bold">Rounds</div>
                <ChartContainer config={fundraisingChartConfig} className="min-h-[200px] w-full">
                  <BarChart data={fundraisingChartData}>
                    <XAxis dataKey="round" tickLine={false} tickMargin={10} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />

                    <Bar dataKey="size" fill="var(--color-size)" radius={4} />
                    <Bar dataKey="valuation" fill="var(--color-valuation)" radius={4} />
                  </BarChart>
                </ChartContainer>
                <div className="text-md bold">CAP Table</div>
                <ChartContainer
                  config={capChartConfig}
                  className="mx-auto min-h-full w-full aspect-square max-h-[250px]"
                >
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="type" hideLabel />} />
                    <Pie data={capChartData} dataKey="percentage">
                      <LabelList
                        dataKey="type"
                        className="fill-background"
                        color="black"
                        fontSize={12}
                        formatter={(token: keyof typeof capChartConfig) => capChartConfig[token]?.label}
                      />
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-3">
            <div className="grid grid-rows-2 gap-4">
              <Card x-chunk="dashboard-05-chunk-3">
                <CardHeader className="px-7">
                  <CardTitle>Holdings</CardTitle>
                  <CardDescription>
                    <div className="text-sm">An overview of your holdings and investments.</div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid col-span-1">
                      <div className="grid grid-rows-3 gap-4">
                        <div className="row-span-1 grid grid-cols-2">
                          <div className="col-span-1">
                            <div className="text-md">Total holdings</div>
                            <div className="text-2xl">$1.2M</div>
                          </div>
                          <div className="col-span-1 grid grid-rows-2  content-between ">
                            <div className="text-md">Runway</div>
                            <Progress value={65} color="black"></Progress>
                          </div>
                        </div>

                        <div className="row-span-1 grid grid-cols-2">
                          <div className="col-span-1">
                            <div className="text-md">Liquid</div>
                            <div className="text-2xl">$200k</div>
                          </div>
                          <div className="col-span-1">
                            <div className="text-md">Principal Chain</div>
                            <div className="text-2xl">Ethereum</div>
                          </div>
                        </div>

                        <div className="row-span-1  grid grid-cols-2">
                          <div className="col-span-1">
                            <div className="text-md">Invested</div>
                            <div className="text-2xl">$1M</div>
                          </div>
                          <div className="col-span-1">
                            <div className="text-md">APY</div>
                            <div className="text-2xl">4.5%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid col-span-1 min-h-[100px]">
                      <ChartContainer
                        config={holdingsChartConfig}
                        className="mx-auto min-h-full w-full aspect-square max-h-[250px]"
                      >
                        <PieChart>
                          <ChartTooltip content={<ChartTooltipContent nameKey="token" hideLabel />} />
                          <Pie data={holdingsChartData} dataKey="value" color="black">
                            <LabelList
                              dataKey="token"
                              className="fill-background"
                              color="black"
                              fontSize={12}
                              formatter={(token: keyof typeof holdingsChartConfig) => holdingsChartConfig[token]?.label}
                            />
                          </Pie>
                        </PieChart>
                      </ChartContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card x-chunk="dashboard-05-chunk-3">
                <CardHeader className="px-7">
                  <CardTitle>Payroll</CardTitle>
                  <CardDescription>
                    <div className="text-sm">An overview of your payroll and team.</div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid col-span-1">
                      <div className="text-md text-center">Recent</div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead className="hidden sm:table-cell">Members</TableHead>
                            <TableHead className="hidden sm:table-cell">Amount</TableHead>
                            <TableHead className="hidden md:table-cell">Paid</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow className="">
                            <TableCell className="hidden md:table-cell">2024-06-23</TableCell>
                            <TableCell className="hidden md:table-cell">24</TableCell>
                            <TableCell className="hidden md:table-cell">$126k</TableCell>
                            <TableCell className="hidden md:table-cell">100%</TableCell>
                          </TableRow>
                          <TableRow className="">
                            <TableCell className="hidden md:table-cell">2024-05-23</TableCell>
                            <TableCell className="hidden md:table-cell">23</TableCell>
                            <TableCell className="hidden md:table-cell">$120k</TableCell>
                            <TableCell className="hidden md:table-cell">100%</TableCell>
                          </TableRow>
                          <TableRow className="">
                            <TableCell className="hidden md:table-cell">2024-04-23</TableCell>
                            <TableCell className="hidden md:table-cell">22</TableCell>
                            <TableCell className="hidden md:table-cell">$110k</TableCell>
                            <TableCell className="hidden md:table-cell">100%</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                    <div className="grid col-span-1">
                      <div className="text-md text-center">Next</div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead className="hidden sm:table-cell">Members</TableHead>
                            <TableHead className="hidden sm:table-cell">Amount</TableHead>
                            <TableHead className="hidden md:table-cell">Paid</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow className="">
                            <TableCell className="hidden md:table-cell">2024-07-23</TableCell>
                            <TableCell className="hidden md:table-cell">26</TableCell>
                            <TableCell className="hidden md:table-cell">$145k</TableCell>
                            <TableCell className="hidden md:table-cell">Pending</TableCell>
                          </TableRow>
                          <TableRow className="">
                            <TableCell className="hidden md:table-cell">2024-08-23</TableCell>
                            <TableCell className="hidden md:table-cell">26</TableCell>
                            <TableCell className="hidden md:table-cell">$145k</TableCell>
                            <TableCell className="hidden md:table-cell">Pending</TableCell>
                          </TableRow>
                          <TableRow className="">
                            <TableCell className="hidden md:table-cell">2024-09-23</TableCell>
                            <TableCell className="hidden md:table-cell">26</TableCell>
                            <TableCell className="hidden md:table-cell">$145k</TableCell>
                            <TableCell className="hidden md:table-cell">Pending</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
