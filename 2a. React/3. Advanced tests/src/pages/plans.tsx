import {
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  Star,
  AlertCircle,
  CheckCircle2,
  LogOut,
  User,
} from "lucide-react";
import { mockPlans } from "@/lib/mock-plans";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

const getTypeColor = (type: string) => {
  switch (type) {
    case "Wykład":
    case "Lecture":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "Laboratorium":
    case "Lab":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "Ćwiczenia":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    case "Seminar":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};

/**
 * !Nie testujcie tego komponentu jakoś szczególnie, on jest tylko po
 * !to, żeby ładnie wyglądało
 * @returns
 */
export const PlansPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="h-8 w-8 text-blue-600" />
                Planer - kocham planer
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Przeglądaj i porównuj różne wersje planu
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{user?.email}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Wyloguj
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={"grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"}>
          {mockPlans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 overflow-hidden hover:shadow-md transition-all ${
                plan.isActive
                  ? "border-blue-500 dark:border-blue-400 shadow-blue-100 dark:shadow-blue-900/20"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              {/* Plan Header */}
              <div
                className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${
                  plan.isActive
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
                    : "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {plan.name}
                      </h3>
                      {plan.isActive && (
                        <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Active
                        </span>
                      )}
                      {plan.isFavorite && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {plan.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {plan.classes.length} zajęć
                      </span>
                      <span>{plan.totalCredits} ECTS</span>
                      {plan.conflicts > 0 && (
                        <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                          <AlertCircle className="h-3 w-3" />
                          {plan.conflicts} konflikt
                          {plan.conflicts > 1 ? "y" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Classes List */}
              <div className="p-6 space-y-4">
                {plan.classes.map((cls) => (
                  <div
                    key={cls.id}
                    className="border border-gray-100 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {cls.courseName}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {cls.courseCode} • {cls.instructor}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getTypeColor(
                          cls.type,
                        )}`}
                      >
                        {cls.type}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span>
                          {cls.day} {cls.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4" />
                        <span>{cls.location}</span>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {cls.credits} ECTS
                    </div>
                  </div>
                ))}
              </div>

              {/* Plan Info Footer */}
              <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Ostatnio modyfikowany:{" "}
                    {new Date(plan.lastModified).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
