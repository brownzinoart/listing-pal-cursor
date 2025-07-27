import React, { useState, useMemo } from "react";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import {
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { SocialPost } from "./SocialPostsDashboard";
import Button from "../shared/Button";

interface SocialPostsTableProps {
  posts: SocialPost[];
  onEdit: (post: SocialPost) => void;
  onCompose: () => void;
}

const SocialPostsTable: React.FC<SocialPostsTableProps> = ({
  posts,
  onEdit,
  onCompose,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<
    "publishedDate" | "engagementRate" | "reach"
  >("publishedDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => {
        const matchesSearch =
          post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.listingAddress
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          post.hashtags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase()),
          );
        const matchesPlatform =
          platformFilter === "all" || post.platform === platformFilter;
        const matchesStatus =
          statusFilter === "all" || post.status === statusFilter;

        return matchesSearch && matchesPlatform && matchesStatus;
      })
      .sort((a, b) => {
        if (sortField === "publishedDate") {
          const dateA = new Date(
            a.publishedDate || a.scheduledDate || a.createdAt,
          ).getTime();
          const dateB = new Date(
            b.publishedDate || b.scheduledDate || b.createdAt,
          ).getTime();
          return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
        } else {
          const valueA = a.metrics[sortField];
          const valueB = b.metrics[sortField];
          return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
        }
      });
  }, [
    posts,
    searchTerm,
    platformFilter,
    statusFilter,
    sortField,
    sortDirection,
  ]);

  const getPlatformIcon = (platform: SocialPost["platform"]) => {
    switch (platform) {
      case "facebook":
        return <FaFacebook className="h-4 w-4 text-blue-600" />;
      case "instagram":
        return <FaInstagram className="h-4 w-4 text-pink-600" />;
      case "twitter":
        return <FaTwitter className="h-4 w-4 text-sky-500" />;
    }
  };

  const getStatusBadge = (status: SocialPost["status"]) => {
    const styles = {
      draft: "bg-gray-100 text-gray-800 border-gray-300",
      scheduled: "bg-blue-100 text-blue-800 border-blue-300",
      published: "bg-green-100 text-green-800 border-green-300",
      archived: "bg-yellow-100 text-yellow-800 border-yellow-300",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-brand-text-tertiary" />
          <input
            type="text"
            placeholder="Search posts, listings, or hashtags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full bg-brand-background border border-brand-border rounded-md text-brand-text-primary placeholder-brand-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>
        <Button
          variant="secondary"
          size="md"
          leftIcon={<FunnelIcon className="h-4 w-4" />}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filters
        </Button>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="flex flex-wrap gap-4 p-4 bg-brand-background rounded-lg border border-brand-border">
          <div>
            <label className="text-sm text-brand-text-secondary mb-1 block">
              Platform
            </label>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="bg-brand-panel border border-brand-border rounded-md px-3 py-1.5 text-sm text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              <option value="all">All Platforms</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="twitter">Twitter</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-brand-text-secondary mb-1 block">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-brand-panel border border-brand-border rounded-md px-3 py-1.5 text-sm text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      )}

      {/* Posts Table */}
      <div className="overflow-x-auto rounded-lg border border-brand-border">
        <table className="w-full">
          <thead className="bg-brand-background border-b border-brand-border">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-brand-text-secondary uppercase tracking-wider">
                Listing
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-brand-text-secondary uppercase tracking-wider">
                Platform
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-brand-text-secondary uppercase tracking-wider">
                Content
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-brand-text-secondary uppercase tracking-wider">
                Status
              </th>
              <th
                className="text-left px-4 py-3 text-xs font-medium text-brand-text-secondary uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("publishedDate")}
              >
                Date
              </th>
              <th
                className="text-left px-4 py-3 text-xs font-medium text-brand-text-secondary uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("engagementRate")}
              >
                Engagement
              </th>
              <th
                className="text-left px-4 py-3 text-xs font-medium text-brand-text-secondary uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("reach")}
              >
                Reach
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-brand-text-secondary uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-brand-panel divide-y divide-brand-border">
            {filteredPosts.map((post) => (
              <tr
                key={post.id}
                className="hover:bg-brand-background/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-brand-text-primary line-clamp-1">
                    {post.listingAddress}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {getPlatformIcon(post.platform)}
                    <span className="text-sm text-brand-text-primary capitalize">
                      {post.platform}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 max-w-xs">
                  <p className="text-sm text-brand-text-primary line-clamp-2">
                    {post.content}
                  </p>
                  <div className="flex gap-2 mt-1">
                    {post.hashtags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="text-xs text-brand-primary">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">{getStatusBadge(post.status)}</td>
                <td className="px-4 py-3 text-sm text-brand-text-secondary">
                  {formatDate(post.publishedDate || post.scheduledDate)}
                </td>
                <td className="px-4 py-3">
                  {post.status === "published" ? (
                    <div className="text-sm">
                      <p className="font-medium text-brand-text-primary">
                        {post.metrics.engagementRate}%
                      </p>
                      <p className="text-xs text-brand-text-secondary">
                        {post.metrics.likes +
                          post.metrics.shares +
                          post.metrics.comments}{" "}
                        interactions
                      </p>
                    </div>
                  ) : (
                    <span className="text-sm text-brand-text-tertiary">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {post.status === "published" ? (
                    <p className="text-sm font-medium text-brand-text-primary">
                      {post.metrics.reach.toLocaleString()}
                    </p>
                  ) : (
                    <span className="text-sm text-brand-text-tertiary">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(post)}
                      className="p-1.5 text-brand-text-secondary hover:text-brand-primary transition-colors"
                      title="Edit Post"
                    >
                      {post.status === "published" ? (
                        <EyeIcon className="h-4 w-4" />
                      ) : (
                        <PencilIcon className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      className="p-1.5 text-brand-text-secondary hover:text-brand-primary transition-colors"
                      title="Duplicate Post"
                    >
                      <DocumentDuplicateIcon className="h-4 w-4" />
                    </button>
                    {post.status === "draft" && (
                      <button
                        className="p-1.5 text-brand-text-secondary hover:text-red-600 transition-colors"
                        title="Delete Post"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-brand-text-secondary mb-4">
            No posts found matching your criteria.
          </p>
          <Button variant="primary" onClick={onCompose}>
            Create Your First Post
          </Button>
        </div>
      )}
    </div>
  );
};

export default SocialPostsTable;
