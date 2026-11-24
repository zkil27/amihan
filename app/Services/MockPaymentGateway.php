<?php

namespace App\Services;

use App\Models\Payment;
use Illuminate\Support\Str;

/**
 * Stand-in for an external payment gateway (the "Payment Gateway" actor
 * in the use-case diagram). No real money moves.
 *
 *  - card  4242 4242 4242 4242 -> approved
 *  - card  4000 0000 0000 0002 -> declined
 *  - any other card that passes the Luhn check -> approved
 *  - gcash -> approved with a mock reference
 *  - cod   -> pending until the courier collects on delivery
 */
class MockPaymentGateway
{
    public const DECLINE_CARD = '4000000000000002';

    /** @return array{status: string, ref: ?string, last4: ?string, message: ?string} */
    public function charge(string $method, float $amount, ?string $cardNumber = null): array
    {
        if ($method === 'cod') {
            return ['status' => 'pending', 'ref' => null, 'last4' => null, 'message' => null];
        }

        if ($method === 'gcash') {
            return ['status' => 'paid', 'ref' => 'GC-'.strtoupper(Str::random(10)), 'last4' => null, 'message' => null];
        }

        $digits = preg_replace('/\D/', '', (string) $cardNumber);

        if (! $this->luhn($digits)) {
            return ['status' => 'failed', 'ref' => null, 'last4' => null, 'message' => 'That card number is not valid.'];
        }

        if ($digits === self::DECLINE_CARD) {
            return ['status' => 'failed', 'ref' => null, 'last4' => substr($digits, -4), 'message' => 'Your bank declined this card. Try another card or GCash.'];
        }

        return ['status' => 'paid', 'ref' => 'CH-'.strtoupper(Str::random(12)), 'last4' => substr($digits, -4), 'message' => null];
    }

    public function refund(Payment $payment, float $amount): string
    {
        return 'RF-'.strtoupper(Str::random(12));
    }

    private function luhn(string $digits): bool
    {
        if (strlen($digits) < 13 || strlen($digits) > 19) {
            return false;
        }

        $sum = 0;
        $alt = false;
        for ($i = strlen($digits) - 1; $i >= 0; $i--) {
            $n = (int) $digits[$i];
            if ($alt) {
                $n *= 2;
                if ($n > 9) {
                    $n -= 9;
                }
            }
            $sum += $n;
            $alt = ! $alt;
        }

        return $sum % 10 === 0;
    }
}
