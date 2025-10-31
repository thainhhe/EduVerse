import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const LearnerProfileDetail = () => {
  // Placeholder data - replace with actual props or state
  const user = {
    fullName: "Alice Johnson",
    email: "alice.johnson@example.com",
    role: "Student",
    dob: "1998-07-15",
    phone: "+1 (555) 123-4567",
    address: "123 Learning Lane, Knowledge City, LC 98765",
    isActive: true,
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">User Details</h1>
      <Card>
        <CardHeader>
          <CardTitle>User Profile Information</CardTitle>
          <CardDescription>
            Edit the user's personal details and account settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" defaultValue={user.fullName} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue={user.email} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              {/* Assuming you might want a Select component later */}
              <select
                id="role"
                defaultValue={user.role}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Student">Student</option>
                <option value="Instructor">Instructor</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input id="dob" type="date" defaultValue={user.dob} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" defaultValue={user.phone} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                defaultValue={user.address}
                rows={3}
                className="min-h-[80px]" // Adjusted height to better match image
              />
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <Label htmlFor="accountStatus" className="font-medium">
              Account Status
            </Label>
            <div className="flex items-center space-x-2">
              <Switch id="accountStatus" defaultChecked={user.isActive} />
              <span className="text-sm text-muted-foreground">
                Toggle to activate or deactivate the user's account.
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 pt-6">
          <Button variant="outline">Cancel</Button>
          <Button>Save Changes</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LearnerProfileDetail;
