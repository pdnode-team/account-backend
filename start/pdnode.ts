import { readFile } from 'fs'
import { parse } from 'smol-toml'

interface PdnodeConfig{
  banned: {
    username: Array<string>,
    nickname: Array<string>
  }
}

export let config: PdnodeConfig

readFile("pdnode.config.toml", "utf8", (err, data) => {
  if(err){
    console.log("Read Config File Failed: " + err)
  }
  try {
      config = parse(data) as unknown as PdnodeConfig;
    } catch (parseError) {
      console.error("Parse Config File Failed, Error: ", parseError);
      throw new Error(`Parse Config File Failed: ${parseError.message}`);
    }
})

// e = error
// s = success
export enum APP_STATUS_CODE {
  /** [Error] The Email already register by other person */
  E_EMAIL_ALREADY_REGISTER = "e_email_already_register",
  /** [Error] This email address does not belong to you. */
  E_NOT_YOUR_EMAIL = "e_not_your_email",
  /** [Error] Your operation was too fast. */
  E_TOO_FAST = "e_too_fast",
  /** [Success] Operation successful */
  SUCCESS = "success",
  /** [Error] Unknown Error */
  FAILED = "failed",
  /** [Error] No identity provided */
  E_MISSING_IDENTIFIER = "e_missing_identifier",
  /** [Error] Provides multiple identities */
  E_MULTIPLE_IDENTIFIERS = "e_multiple_identifiers",
  /** [Error] Wrong Email Verify Code */
  E_WRONG_EMAIL_CODE = "e_wrong_email_code",
  /** [Error] Username or Email existing */
  E_USERNAME_OR_EMAIL_EXISTING = "e_username_or_email_existing",
  /** [Error] New Password same as old password */
  E_NEW_PASSWORD_SAME_AS_OLD_PASSWORD = "e_new_password_same_as_old_password",
  /** [Error] Username already register */
  E_USERNAME_ALREADY_REGISTER = "e_username_already_register",

}
