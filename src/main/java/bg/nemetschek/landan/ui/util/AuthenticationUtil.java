package bg.nemetschek.landan.ui.util;

import org.apache.commons.codec.binary.Base64;

/**
 * JIRA API Authentication/Authorization 
 * @author Elitza Haltakova
 *
 */
public class AuthenticationUtil {
			
	public static final String username = "Elitza Haltakova";
	public static final String password = "homq4e98";
	
	public static String getBase64EncodedCredentials() {
		String plainCreds = username + ":" + password;
		byte[] plainCredsBytes = plainCreds.getBytes();
		byte[] base64CredsBytes = Base64.encodeBase64(plainCredsBytes);
		String base64Creds = new String(base64CredsBytes);
		return base64Creds;
	}
	
	public static String getBase64EncodedCredentialsDemoUser() {
		String plainCreds = "atcdemo" + ":" + "atcpass";
		byte[] plainCredsBytes = plainCreds.getBytes();
		byte[] base64CredsBytes = Base64.encodeBase64(plainCredsBytes);
		String base64Creds = new String(base64CredsBytes);
		return base64Creds;
	}
}
