package com.email.writer.service;

import com.email.writer.model.EmailRequest;
import com.email.writer.model.ModifyEmailRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class EmailGeneratorService {

    private final WebClient webClient;

    @Value("${gemini.api.url}")
    private String GEMINI_URL;
    @Value("${gemini.api.key}")
    private String GEMINI_KEY;

    public EmailGeneratorService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public String generateEmailReply(EmailRequest emailRequest){
        String prompt = buildPrompt(emailRequest);
        String response = getAiResponse(prompt);
        return response;
    }

    private String getAiResponse(String prompt) {
        Map<String, Object> requestBody = Map.of(
                "contents", new Object[]{
                        Map.of("parts", new Object[] {
                                Map.of("text", prompt)
                        })
                }
        );

        String response = webClient.post()
                .uri(GEMINI_URL + GEMINI_KEY)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        return extractResponseContent(response);
    }

    private String extractResponseContent(String response) {
        try{
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(response);
            return rootNode.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();

        }catch (Exception e){
            return e.getMessage();
        }
    }

    private String buildPrompt(EmailRequest emailRequest) {
        StringBuilder prompt = new StringBuilder();
        String emailLength = emailRequest.getLength();
        if(emailLength != null && !emailLength.isEmpty()){
            emailLength = "in "+emailLength;
        }
        prompt.append("Reply to following email query "+emailLength+" without any subject line or explanation.");
        if(emailRequest.getTone() != null && !emailRequest.getTone().isEmpty()){
            prompt.append("Use ").append(emailRequest.getTone()).append(" tone");
        }
        prompt.append("\nOriginal email : \n").append(emailRequest.getEmailContent());
        return prompt.toString();
    }

    public String modifyReply(ModifyEmailRequest modifyEmailRequest) {
        String prompt = "Given email reply by you : \n'" +
                modifyEmailRequest.getGeneratedReply() +
                ".' \n" + modifyEmailRequest.getModification() + " the content of this without any subject line or explanation";
        return getAiResponse(prompt);
    }
}
