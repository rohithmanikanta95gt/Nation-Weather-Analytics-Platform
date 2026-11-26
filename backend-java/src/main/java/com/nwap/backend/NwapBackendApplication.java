package com.nwap.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class NwapBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(NwapBackendApplication.class, args);
    }
}
