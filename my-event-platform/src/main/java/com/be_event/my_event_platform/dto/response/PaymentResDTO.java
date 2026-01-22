package com.be_event.my_event_platform.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
public class PaymentResDTO implements Serializable {
    private String status;
    private String message;
    private String URL;

    public PaymentResDTO(String status, String message, String URL) {
        this.status = status;
        this.message = message;
        this.URL = URL;
    }
}