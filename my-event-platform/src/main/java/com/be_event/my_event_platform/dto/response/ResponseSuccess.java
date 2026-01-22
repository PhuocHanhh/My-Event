package com.be_event.my_event_platform.dto.response;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MultiValueMap;

public class ResponseSuccess extends ResponseEntity<ResponseSuccess.PayLoad> {

    public ResponseSuccess(HttpStatusCode status, String message) {
        super(new PayLoad(status.value(),message), HttpStatus.OK);
    }

    public ResponseSuccess(PayLoad body, HttpStatusCode status) {
        super(body, status);
    }

    public ResponseSuccess(MultiValueMap<String, String> headers, HttpStatusCode status) {
        super(headers, status);
    }

    public ResponseSuccess(PayLoad body, MultiValueMap<String, String> headers, int rawStatus) {
        super(body, headers, rawStatus);
    }

    public ResponseSuccess(PayLoad body, MultiValueMap<String, String> headers, HttpStatusCode statusCode) {
        super(body, headers, statusCode);
    }

    @Getter
    public static class PayLoad{
        private final int status;
        private final String message;
        private Object data;

        public PayLoad(int status, String message) {
            this.status = status;
            this.message = message;
        }

        public PayLoad(int status, String message, Object data) {
            this.status = status;
            this.message = message;
            this.data = data;
        }
    }
}
