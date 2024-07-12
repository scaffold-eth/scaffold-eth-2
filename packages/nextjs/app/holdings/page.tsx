"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Copy, CreditCard, File, ListFilter, MoreVertical, Truck } from "lucide-react";
import { NextPage } from "next";
import { LabelList, Pie, PieChart } from "recharts";
import { Badge } from "~~/components/ui/badge";
import { Button } from "~~/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~~/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "~~/components/ui/chart";
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
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "~~/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~~/components/ui/tabs";

const holdingsChartData = [
  { token: "USDC", value: 100000, fill: "#F4B678" },
  { token: "DAI", value: 100000, fill: "#EF9234" },
  { token: "BUIDL", value: 400000, fill: "#EC7A08" },
  { token: "FOBXX", value: 400000, fill: "#C46100" },
  { token: "XEVT", value: 200000, fill: "#8F4700" },
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

const Holdings: NextPage = () => {
  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-4">
      {/* <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
        <Card className="sm:col-span-12" x-chunk="dashboard-05-chunk-0">
          <CardHeader className="pb-3">
            <CardTitle>Holdings Overview</CardTitle>
            <CardDescription className="max-w-lg text-balance leading-relaxed">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <div className="text-3xl font-medium text-balance">Assets 5</div>
                  <div className="text-sm text-muted-foreground">Assets</div>
                </div>
              </div>
            </CardDescription>
          </CardHeader>
        </Card>
      </div> */}
      <Card x-chunk="dashboard-05-chunk-3">
        <CardHeader className="px-7">
          <CardTitle>Assets</CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1 w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead className="hidden sm:table-cell">Amount</TableHead>
                    <TableHead className="hidden sm:table-cell">USD Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="">
                    <TableCell>
                      <div className="font-medium">USDC</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">200.000</TableCell>
                    <TableCell className="hidden sm:table-cell">$200.000</TableCell>
                  </TableRow>
                  <TableRow className="">
                    <TableCell>
                      <div className="font-medium">DAI</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">100.000</TableCell>
                    <TableCell className="hidden sm:table-cell">$100.000</TableCell>
                  </TableRow>
                  <TableRow className="">
                    <TableCell>
                      <div className="font-medium">BUIDL</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">323.452</TableCell>
                    <TableCell className="hidden sm:table-cell">$400.000</TableCell>
                  </TableRow>
                  <TableRow className="">
                    <TableCell>
                      <div className="font-medium">FOBXX</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">34.431</TableCell>
                    <TableCell className="hidden sm:table-cell">$400.000</TableCell>
                  </TableRow>
                  <TableRow className="">
                    <TableCell>
                      <div className="font-medium">XEVT</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">43.123</TableCell>
                    <TableCell className="hidden sm:table-cell">$200.000</TableCell>
                  </TableRow>
                </TableBody>
                <TableFooter></TableFooter>
                <div className="flex gap-4">
                  <Button disabled className="mt-4 col-span-5">
                    Invest (coming soon)
                  </Button>
                  <Link href="/fundraising" className="col-span-3">
                    <Button variant="outline" className="mt-4 w-100">
                      Fundraise
                    </Button>
                  </Link>
                </div>
              </Table>
            </div>
            <div className="col-span-1">
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
    </div>
  );
};

export default Holdings;
