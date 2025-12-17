import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export const ReasonDialog = ({ open, onOpenChange, onSubmit }) => {
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");

    const handleReasonChange = (e) => {
        setReason(e.target.value);
    };

    const handleSubmit = () => {
        if (!reason || !reason.trim()) {
            setError("Reason is required");
            return;
        }

        const normalizedReason = reason.trim().replace(/\s+/g, " ");
        onSubmit(normalizedReason);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reason for reporting this comment</DialogTitle>
                </DialogHeader>
                <Input value={reason} onChange={handleReasonChange} />
                {error && <p className="text-red-500">{error}</p>}
                <Button onClick={handleSubmit}>Submit</Button>
            </DialogContent>
        </Dialog>
    );
};
