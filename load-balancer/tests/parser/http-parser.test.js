import {describe, it, expect} from "@jest/globals";
import {
    getHeaders,
    getContentLength,
    isMessageComplete,
    addSignatureToRequest,
    isMessageValidHTTP
} from "../../src/parser/http-parser";
  
describe("HTTP Parser", () => {
    describe("getHeaders", () => {
        it("should return an array of headers on request without body", () => {
            const request = "GET /cart/1 HTTP/1.1\r\nHost: example.com\r\nUser-Agent: Mozilla\r\n\r\n";
            const expectedHeaders = ["GET /cart/1 HTTP/1.1", "Host: example.com", "User-Agent: Mozilla"];
  
            const headers = getHeaders(request);
  
            expect(headers).toEqual(expectedHeaders);
        });
        it("should return an array of headers on request with body", () => {
            const request = "POST /cart/1 HTTP/1.1\r\nHost: example.com\r\nUser-Agent: Mozilla\r\nContent-Length: 2\r\n" +
            "Content-Type: application/json\r\n\r\n{}\r\n\r\n";
            const expectedHeaders = ["POST /cart/1 HTTP/1.1", "Host: example.com", "User-Agent: Mozilla", "Content-Length: 2",
                "Content-Type: application/json"];
  
            const headers = getHeaders(request);
  
            expect(headers).toEqual(expectedHeaders);
        });
    });
  
    describe("getContentLength", () => {
        it("should return the content length from the header array", () => {
            const headerArray = [
                "POST /cart/1 HTTP/1.1",
                "Host: example.com",
                "User-Agent: Mozilla",
                "Content-Length: 100",
                "Content-Type: application/json"
            ];
            const expectedContentLength = 100;
  
            const contentLength = getContentLength(headerArray);
  
            expect(contentLength).toBe(expectedContentLength);
        });
  
        it("should return 0 if the Content-Length header is not found", () => {
            const headerArray = [
                "GET /cart/1 HTTP/1.1",
                "Host: example.com",
                "User-Agent: Mozilla",
            ];
            const expectedContentLength = 0;
  
            const contentLength = getContentLength(headerArray);
  
            expect(contentLength).toBe(expectedContentLength);
        });
    });
  
    describe("isMessageComplete", () => {
        it("should return true if the message is complete", () => {
            const completeData = "GET /cart/1 HTTP/1.1\r\nHost: example.com\r\n\r\n";
            const isComplete = isMessageComplete(Buffer.from(completeData));
  
            expect(isComplete).toBe(true);
        });
  
        it("should return false if the message is incomplete", () => {
            const incompleteData = "GET /cart/1 HTTP/1.1\r\nHost: example.com\r\n";
            const isComplete = isMessageComplete(Buffer.from(incompleteData));
  
            expect(isComplete).toBe(false);
        });
  
        it("should handle content-length in the request headers", () => {
            const completeData = "POST /cart/1 HTTP/1.1\r\nHost: example.com\r\nContent-Length: 11\r\n\r\nHello World";
            const incompleteData = "POST /cart/1 HTTP/1.1\r\nHost: example.com\r\nContent-Length: 11\r\n\r\nHello ";
  
            const completeDataComplete = isMessageComplete(Buffer.from(completeData));
            const incompleteDataComplete = isMessageComplete(Buffer.from(incompleteData));
  
            expect(completeDataComplete).toBe(true);
            expect(incompleteDataComplete).toBe(false);
        });
    });
  
    describe("addSignatureToRequest", () => {
        it("should add the signature header to the request", () => {
            const request = "GET /cart/1 HTTP/1.1\r\nHost: example.com\r\n\r\n";
            const signature = "abc123";
            const expectedRequest =
          "GET /cart/1 HTTP/1.1\r\nHost: example.com\r\nX-Signature: abc123\r\n\r\n";
  
            const modifiedRequest = addSignatureToRequest(request, signature);
  
            expect(modifiedRequest.toString()).toBe(expectedRequest);
        });
  
        it("should preserve the request body if present", () => {
            const requestWithBody =
          "POST /cart/1 HTTP/1.1\r\nHost: example.com\r\nContent-Length: 5\r\n\r\nHello";
            const signature = "abc123";
            const expectedRequest =
          "POST /cart/1 HTTP/1.1\r\nHost: example.com\r\nContent-Length: 5\r\nX-Signature: abc123\r\n\r\nHello";
  
            const modifiedRequest = addSignatureToRequest(requestWithBody, signature);
  
            expect(modifiedRequest.toString()).toBe(expectedRequest);
        });
    });

    describe("isMessageValidHTTP", () => {
        it("should return true for valid HTTP methods", () => {
            expect(isMessageValidHTTP(Buffer.from("GET /cart/1 HTTP/1.1\r\n"))).toBe(true);
            expect(isMessageValidHTTP(Buffer.from("POST /cart/1 HTTP/1.1\r\n"))).toBe(true);
            expect(isMessageValidHTTP(Buffer.from("PUT /cart/1 HTTP/1.1\r\n"))).toBe(true);
            expect(isMessageValidHTTP(Buffer.from("DELETE /cart/1 HTTP/1.1\r\n"))).toBe(true);
            expect(isMessageValidHTTP(Buffer.from("CONNECT /cart/1 HTTP/1.1\r\n"))).toBe(true);
            expect(isMessageValidHTTP(Buffer.from("HEAD /cart/1 HTTP/1.1\r\n"))).toBe(true);
            expect(isMessageValidHTTP(Buffer.from("OPTIONS /cart/1 HTTP/1.1\r\n"))).toBe(true);
            expect(isMessageValidHTTP(Buffer.from("TRACE /cart/1 HTTP/1.1\r\n"))).toBe(true);
            expect(isMessageValidHTTP(Buffer.from("PATCH /cart/1 HTTP/1.1\r\n"))).toBe(true);
        });
        
        it("should return false for invalid HTTP methods", () => {
            expect(isMessageValidHTTP(Buffer.from("INVALID /cart/1 HTTP/1.1\r\n"))).toBe(false);
            expect(isMessageValidHTTP(Buffer.from("INVALIDMETHOD /cart/1 HTTP/1.1\r\n"))).toBe(false);
            expect(isMessageValidHTTP(Buffer.from("PUTT /cart/1 HTTP/1.1\r\n"))).toBe(false);
            expect(isMessageValidHTTP(Buffer.from("DELET /cart/1 HTTP/1.1\r\n"))).toBe(false);
            expect(isMessageValidHTTP(Buffer.from("CONNNECT /cart/1 HTTP/1.1\r\n"))).toBe(false);
            expect(isMessageValidHTTP(Buffer.from("HEAD1 /cart/1 HTTP/1.1\r\n"))).toBe(false);
            expect(isMessageValidHTTP(Buffer.from("OPTION /cart/1 HTTP/1.1\r\n"))).toBe(false);
            expect(isMessageValidHTTP(Buffer.from("TRACEE /cart/1 HTTP/1.1\r\n"))).toBe(false);
            expect(isMessageValidHTTP(Buffer.from("PATCHH /cart/1 HTTP/1.1\r\n"))).toBe(false);
        });
        
        it("should return false if first line separator not found", () => {
            expect(isMessageValidHTTP(Buffer.from("GET /cart/1 HTTP/1.1"))).toBe(false);
            expect(isMessageValidHTTP(Buffer.from("GET /cart/1 HTTP/1.1\n"))).toBe(false);
            expect(isMessageValidHTTP(Buffer.from("GET /cart/1 HTTP/1.1\n\n"))).toBe(false);
        });
        
        it("should return false if data is empty", () => {
            expect(isMessageValidHTTP(Buffer.from(""))).toBe(false);
        });
        
        it("should return false if data is not a string", () => {
            expect(isMessageValidHTTP(Buffer.from([123]))).toBe(false);
            expect(isMessageValidHTTP(Buffer.from([]))).toBe(false);
        });
    });
});
  