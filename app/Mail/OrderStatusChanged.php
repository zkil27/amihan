<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** Shipping updates (confirmed, shipped, delivered) and cancellations. */
class OrderStatusChanged extends Mailable
{
    use Queueable, SerializesModels;

    public const COPY = [
        'confirmed' => ['We have your order', 'Your order is confirmed and our roasters are preparing it.'],
        'shipped' => ['Your order is on its way', 'Your parcel has left the ridge and is on its way down the mountain.'],
        'delivered' => ['Delivered', 'Your order has arrived. We hope the first cup is a quiet one.'],
        'cancelled' => ['Your order was cancelled', 'Your order has been cancelled. If you paid online, the refund is on its way.'],
    ];

    public function __construct(public Order $order, public ?string $note = null) {}

    public function envelope(): Envelope
    {
        [$title] = self::COPY[$this->order->status] ?? ['Order update'];

        return new Envelope(subject: "{$title}: {$this->order->order_no}");
    }

    public function content(): Content
    {
        [$title, $body] = self::COPY[$this->order->status] ?? ['Order update', 'Your order status changed.'];

        return new Content(view: 'mail.order-status', text: 'mail.text.order-status', with: [
            'title' => $title,
            'body' => $body,
            'url' => route('account.orders.show', $this->order),
        ]);
    }
}
