<?php

namespace App\Mail;

use App\Models\ReturnRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** Sent when a return / cancellation is requested, approved (with refund) or declined. */
class ReturnRequestUpdated extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public ReturnRequest $request) {}

    public function envelope(): Envelope
    {
        $kind = $this->request->type === 'cancellation' ? 'Cancellation' : 'Return';
        $state = match ($this->request->status) {
            'requested' => 'request received',
            'completed', 'approved' => 'approved',
            'rejected' => 'request declined',
            default => 'update',
        };

        return new Envelope(subject: "{$kind} {$state}: {$this->request->order->order_no}");
    }

    public function content(): Content
    {
        return new Content(view: 'mail.return-update', text: 'mail.text.return-update', with: [
            'url' => route('account.orders.show', $this->request->order),
        ]);
    }
}
