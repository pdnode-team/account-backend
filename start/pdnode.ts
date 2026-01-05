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
