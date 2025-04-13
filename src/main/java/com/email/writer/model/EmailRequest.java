package com.email.writer.model;


public class EmailRequest {
    private String emailContent;
    private String tone;

    public String getLength() {
        return length;
    }

    public void setLength(String length) {
        this.length = length;
    }

    private String length;

    public String getEmailContent() {
        return emailContent;
    }

    public void setEmailContent(String emailContent) {
        this.emailContent = emailContent;
    }

    public String getTone() {
        return tone;
    }

    public void setTone(String tone) {
        this.tone = tone;
    }
}
