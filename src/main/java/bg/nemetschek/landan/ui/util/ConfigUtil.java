package bg.nemetschek.landan.ui.util;

/**
 * Application Configuration.
 * @author Elitza Haltakova
 *
 */
public class ConfigUtil {

	public static final String HOST = "http://localhost";
	public static final int PORT = 6789;
		
	public static final ApplicationMode appMode = ApplicationMode.DEV;
				
	public enum ApplicationMode {
		PROD,
		DEV;
	}
}
