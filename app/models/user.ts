import { DbAccessTokensProvider } from "@adonisjs/auth/access_tokens";
import { withAuthFinder } from "@adonisjs/auth/mixins/lucid";
import { compose } from "@adonisjs/core/helpers";
import hash from "@adonisjs/core/services/hash";
import { BaseModel, beforeCreate, column } from "@adonisjs/lucid/orm";
import {v4 as uuidv4} from "uuid"
import { DateTime } from "luxon";

const AuthFinder = withAuthFinder(() => hash.use("scrypt"), {
  uids: ["email"],
  passwordColumnName: "password",
});

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: string;

  @column()
  declare username: string;

  @column()
  declare nickname: string | null;

  @column()
  declare email: string;

  @column({ serializeAs: null })
  declare password: string;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null;

  static accessTokens = DbAccessTokensProvider.forModel(User);

  @beforeCreate()
  static generateUuid(user: User){
    if(!user.id){
      user.id = uuidv4()

    }
  }
}
