package com.backend.backend.config;

import io.github.bucket4j.Bucket;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Refill;
import java.time.Duration;

import org.springframework.stereotype.Service;

@Service
public class RateLimitService {

    public Bucket createBucket() {
        long capacity = 10; // Maximum number of tokens
        Duration duration = Duration.ofMinutes(5); // Refill interval
        Refill refill = Refill.greedy(capacity, duration);
        Bandwidth limit = Bandwidth.classic(capacity, refill);
        return Bucket.builder().addLimit(limit).build();
    }
}
