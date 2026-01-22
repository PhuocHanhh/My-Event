package com.be_event.my_event_platform.controller;

import com.example.myevent_be.dto.request.AIRequest;
import com.example.myevent_be.dto.response.AIResponse;
import com.example.myevent_be.service.AIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
//@CrossOrigin(origins = "*")
public class AIController {

    @Autowired
    private AIService googleAIService;
    public AIController(AIService aiService) {
        this.googleAIService = aiService;
    }

    @GetMapping("/start")
    public AIResponse start() {
        return googleAIService.startConversation();
    }

    @PostMapping("/generate")
    public AIResponse generate(@RequestBody AIRequest request) {
        if (request.getPrompt() == null || request.getPrompt().isBlank()) {
            AIResponse response = new AIResponse();
            response.setMessage("Vui lòng chọn loại sự kiện.");
            return response;
        }
        return googleAIService.generateResponse(request.getPrompt());
    }
}
