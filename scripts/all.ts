import { getAccountByName } from "@kubiklabs/wasmkit";

import { ReclaimClientContract } from "../artifacts/typescript_schema/ReclaimClientContract";

import fs from 'fs'

export default async function run (network: any) {
  const runTs = String(new Date());
  const contract_owner = await getAccountByName("account_0");
  const reclaim_contract = new ReclaimClientContract();
  await reclaim_contract.setupClient();

  const content = JSON.parse(
      fs.readFileSync('scripts/config.json', 'utf-8')
  )
  const coreContractAddress = content[network.network.name]

  // Deploy Contract

  const deploy_response = await reclaim_contract.deploy(
    contract_owner
  );
  
  // Instantiate Contract

  const contract_info = await reclaim_contract.instantiate(
    {
      contract: coreContractAddress
    },
    `deploy test ${runTs}`,
    contract_owner,
    undefined,  // transferAmount
    // customFees
  );
  console.log(contract_info);

  //////////////Verify/////////////////
  
  const owner = "0xe4c20c9f558160ec08106de300326f7e9c73fb7f"

  const claimInfo = {
      "provider": "http",
      "parameters": "{\"body\":\"\",\"geoLocation\":\"in\",\"method\":\"GET\",\"responseMatches\":[{\"type\":\"contains\",\"value\":\"_steamid\\\">Steam ID: 76561199632643233</div>\"}],\"responseRedactions\":[{\"jsonPath\":\"\",\"regex\":\"_steamid\\\">Steam ID: (.*)</div>\",\"xPath\":\"id(\\\"responsive_page_template_content\\\")/div[@class=\\\"page_header_ctn\\\"]/div[@class=\\\"page_content\\\"]/div[@class=\\\"youraccount_steamid\\\"]\"}],\"url\":\"https://store.steampowered.com/account/\"}",
      "context": "{\"contextAddress\":\"user's address\",\"contextMessage\":\"for acmecorp.com on 1st january\"}",
  }

  const identifier = "0x531322a6c34e5a71296a5ee07af13f0c27b5b1e50616f816374aff6064daaf55"

  const signedClaim = {
      "claim": {
          "identifier": identifier,
          "owner": owner,
          "epoch": 1,
          "timestampS": 1710157447
      },
      "signatures": ["0x52e2a591f51351c1883559f8b6c6264b9cb5984d0b7ccc805078571242166b357994460a1bf8f9903c4130f67d358d7d6e9a52df9a38c51db6a10574b946884c1b"],
  }

  const proof = {
      claimInfo: claimInfo,
      signedClaim: signedClaim
  }

  const ex_response = await reclaim_contract.executeMsg(
      {
          "verify_proof": {
              proof: proof
          }
      },
      contract_owner
  );
  console.log(ex_response);
}