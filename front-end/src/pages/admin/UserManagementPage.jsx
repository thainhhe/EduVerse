import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PlusCircle,
  File,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const users = [
  {
    name: "Alice Wonderland",
    email: "alice@example.com",
    role: "Student",
    status: "Active",
    creationDate: "2023-01-15",
    lastLogin: "2024-03-20",
    avatar: "/student-woman.png",
  },
  {
    name: "Bob The Builder",
    email: "bob@example.com",
    role: "Lecturer",
    status: "Active",
    creationDate: "2022-11-01",
    lastLogin: "2024-03-19",
    avatar: "/professional-man.jpg",
  },
  {
    name: "Charlie Chaplin",
    email: "charlie@example.com",
    role: "Student",
    status: "Locked",
    creationDate: "2023-03-10",
    lastLogin: "2023-12-01",
    avatar: "/student-man.jpg",
  },
  {
    name: "Diana Prince",
    email: "diana@example.com",
    role: "Lecturer",
    status: "Pending",
    creationDate: "2024-01-05",
    lastLogin: "N/A",
    avatar: "/professional-woman-diverse.png",
  },
];

const statusVariant = {
  Active: "default",
  Locked: "destructive",
  Pending: "secondary",
};

const UserManagementPage = () => {
  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <h1 className="text-3xl font-bold">User Management</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline">
            <File className="mr-2 h-4 w-4" /> Export Data
          </Button>
          <Button className="bg-primary">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New User
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="hidden md:table-cell">Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">
                  Creation Date
                </TableHead>
                <TableHead className="hidden sm:table-cell">
                  Last Login
                </TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground hidden sm:block">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {user.role}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[user.status]}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {user.creationDate}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {user.lastLogin}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-center items-center gap-4 mt-6">
        <Button variant="outline">
          <ChevronLeft className="h-4 w-4 mr-2" /> Previous
        </Button>
        <span>1 / 3</span>
        <Button variant="outline">
          Next <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default UserManagementPage;
