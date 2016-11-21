package com.nemetschek.innovation.util;

import static org.junit.Assert.*;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.charset.Charset;
import java.util.HashMap;
import java.util.Map;

import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.entity.StringEntity;
import org.apache.http.entity.mime.MultipartEntity;
import org.apache.http.entity.mime.content.FileBody;
import org.apache.http.entity.mime.content.StringBody;
import org.apache.http.impl.client.HttpClientBuilder;

/**
 * Utility class providing features for executing POST and GET requests.
 * @author Elitza Haltakova
 *
 */
public class HTTPUtil {

	public static HTTPResponse postRequest(String baseUrl, String path, String jsonStrBody,  Map<String, String> headers) {
		try {
			String url = baseUrl + path;
			HttpClient client =  HttpClientBuilder.create().build();
			HttpPost post = new HttpPost(url);
			for(String key : headers.keySet()) {
				post.setHeader(key, headers.get(key));
			}
			StringEntity body = new StringEntity(jsonStrBody, Charset.forName("UTF-8"));
			post.setEntity(body);

			HttpResponse response = client.execute(post);
			String responseText = "";
			if(response.getEntity() != null) {
				String line = "";
				BufferedReader rd = new BufferedReader(new InputStreamReader(response.getEntity().getContent()));
				StringBuffer result = new StringBuffer();
				while ((line = rd.readLine()) != null) {
					result.append(line);
				}
				responseText = result.toString();
			}
			return new HTTPResponse(response.getStatusLine().getStatusCode(), responseText);
		} catch (IOException e) {
			e.printStackTrace();
			fail("Sending request failed: " + e.getMessage());
			return null;
		}
	}
	
	public static HTTPResponse getRequest(String url, Map<String, String> headers) {
		try {
			HttpClient client =  HttpClientBuilder.create().build();
			HttpGet get = new HttpGet(url);
			for(String key : headers.keySet()) {
				get.setHeader(key, headers.get(key));
			}

			HttpResponse response = client.execute(get);
			
			BufferedReader rd = new BufferedReader(new InputStreamReader(response.getEntity().getContent()));
			StringBuffer result = new StringBuffer();
			String line = "";
			while ((line = rd.readLine()) != null) {
				result.append(line);
			}
			String responseText = result.toString();
			return new HTTPResponse(response.getStatusLine().getStatusCode(), responseText);
		} catch (IOException e) {
			e.printStackTrace();
			fail("Sending request failed: " + e.getMessage());
			return null;
		}
	}
	
	public static HTTPResponse postMultiPartRequest(String url, HashMap<String, Object> multipartData) {
		try {
			HttpClient httpclient = HttpClientBuilder.create().build();
			HttpPost httpPost = new HttpPost(url);
			
			MultipartEntity reqEntity = new MultipartEntity();
			for(String key : multipartData.keySet()) {
				Object value = multipartData.get(key);
				if(value instanceof String) {
					reqEntity.addPart(key, new StringBody((String) value));
				} else if(value instanceof File) {
					reqEntity.addPart(key, new FileBody((File) value));
				}
			}
			httpPost.setEntity(reqEntity);
			
			HttpResponse resp = httpclient.execute(httpPost);
				
			BufferedReader rd = new BufferedReader(new InputStreamReader(resp.getEntity().getContent()));
			StringBuffer result = new StringBuffer();
			String line = "";
			while ((line = rd.readLine()) != null) {
				result.append(line);
			}
			String responseText = result.toString();
			return new HTTPResponse(resp.getStatusLine().getStatusCode(), responseText);
		} catch (ClientProtocolException e) {
			fail("Sending request failed: " + e.getMessage());
			return null;
		} catch (IOException e) {
			fail("Sending request failed: " + e.getMessage());
			return null;
		}
	}
	
	public static class HTTPResponse {
		
		public final String body;
		public final int status;

		public HTTPResponse(int status, String body) {
			this.status = status;
			this.body = body;
		}
	}
	
	public static String constructURL(String scheme, String host, int port, String path) {
		String urlStr = null;
		try {
			URIBuilder uriBuilder = new URIBuilder().setHost(host).setScheme(scheme).setPort(port).setPath(path);
			URI uri = uriBuilder.build();
			URL url = uri.toURL();
			urlStr = url.toString();
		} catch (MalformedURLException e) {
			e.printStackTrace();
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
		return urlStr;
	}
}

