import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export const ReasonDialog = ({ open, onOpenChange, onSubmit }) => {
    const [reason, setReason] = useState("");

    const handleReasonChange = (e) => {
        setReason(e.target.value);
    };

    const handleSubmit = () => {
        onSubmit(reason);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reason for reporting this comment</DialogTitle>
                </DialogHeader>
                <Input value={reason} onChange={handleReasonChange} />
                <Button onClick={handleSubmit}>Submit</Button>
            </DialogContent>
        </Dialog>
    );
};
