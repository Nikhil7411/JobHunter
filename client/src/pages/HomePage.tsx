import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "wouter";
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Filter, 
  Plus 
} from "lucide-react";
import { AppDispatch, RootState } from "@/store";
import { fetchJobs, setFilter, clearFilters } from "@/store/jobsSlice";
import Layout from "@/components/layout/Layout";
import { JobCard } from "@/components/ui/job-card";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function HomePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { jobs, loading, filters } = useSelector((state: RootState) => state.jobs);
  const { isCompany } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [locationInput, setLocationInput] = useState(filters.location || "");
  const [typeInput, setTypeInput] = useState(filters.type || "");
  const [filterOpen, setFilterOpen] = useState(false);

  // Fetch jobs on initial load
  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setFilter({ key: "search", value: searchInput }));
    dispatch(fetchJobs());
  };

  // Handle filter form submission
  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setFilter({ key: "location", value: locationInput }));
    dispatch(setFilter({ key: "type", value: typeInput }));
    dispatch(fetchJobs());
    setFilterOpen(false);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchInput("");
    setLocationInput("");
    setTypeInput("");
    dispatch(clearFilters());
    dispatch(fetchJobs());
    setFilterOpen(false);
  };

  // Handle pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentJobs = jobs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(jobs.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Layout>
      {/* Job Overview Section */}
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">Job Listings</h2>
          <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
              {filters.location || "All locations"}
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Briefcase className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
              {filters.type || "All job types"}
            </div>
          </div>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          {isCompany && (
            <Button asChild>
              <Link href="/post-job">
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                Post Job
              </Link>
            </Button>
          )}
          
          <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                Filter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filter Jobs</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleFilterSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label htmlFor="location" className="text-sm font-medium">Location</label>
                  <Input
                    id="location"
                    placeholder="e.g. San Francisco, Remote"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="type" className="text-sm font-medium">Job Type</label>
                  <Input
                    id="type"
                    placeholder="e.g. Full-time, Part-time"
                    value={typeInput}
                    onChange={(e) => setTypeInput(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                  <Button type="submit">Apply Filters</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="mb-8">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Find your dream job</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search job title, company, or keywords..."
                className="pl-9"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {/* Job Listings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-5 h-64"></CardContent>
            </Card>
          ))}
        </div>
      ) : jobs.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {currentJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
          
          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={jobs.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Briefcase className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No jobs found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
              We couldn't find any jobs matching your search criteria. Try adjusting your filters or check back later.
            </p>
            <Button variant="outline" className="mt-4" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </Layout>
  );
}
