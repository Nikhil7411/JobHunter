import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Job } from '@shared/schema';
import { Link } from 'wouter';
import { MapPin } from 'lucide-react';

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const { 
    id, 
    title, 
    company, 
    companyLogo, 
    location, 
    description, 
    salary, 
    type, 
    tags = [],
    createdAt 
  } = job;

  // Format the date for "Posted X days ago"
  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Posted today';
    } else if (diffDays === 1) {
      return 'Posted 1 day ago';
    } else {
      return `Posted ${diffDays} days ago`;
    }
  };

  // Get tag color based on tag content
  const getTagColor = (tag: string) => {
    const tagLower = tag.toLowerCase();
    if (tagLower === 'full-time') return 'bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-100';
    if (tagLower === 'part-time') return 'bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-100';
    if (tagLower === 'remote') return 'bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100';
    if (tagLower === 'on-site' || tagLower === 'onsite') return 'bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-100';
    if (tagLower === 'hybrid') return 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100';
    // Default color for other tags
    return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100';
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-5">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
            <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">{company}</p>
          </div>
          {companyLogo ? (
            <img className="h-12 w-12 rounded object-cover" src={companyLogo} alt={`${company} logo`} />
          ) : (
            <div className="h-12 w-12 rounded bg-primary-100 dark:bg-primary-800 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold">
              {company.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline" className={getTagColor(type)}>
            {type}
          </Badge>
          
          {tags && tags.map((tag, index) => (
            <Badge key={index} variant="outline" className={getTagColor(tag)}>
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
          {description}
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
            {location}
          </div>
          {salary && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {salary}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-700 px-5 py-3 flex justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {formatDate(createdAt)}
        </div>
        <Link href={`/jobs/${id}`} className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
          View Details
        </Link>
      </CardFooter>
    </Card>
  );
}
