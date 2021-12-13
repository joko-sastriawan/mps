/*********************************************************************
* Copyright (c) Intel Corporation 2019
* SPDX-License-Identifier: Apache-2.0
* Description: Handler to get amt device current power state
**********************************************************************/

import { Response, Request } from 'express'
import { logger as log } from '../../utils/logger'
import { ErrorResponse } from '../../utils/amtHelper'
import { MqttProvider } from '../../utils/MqttProvider'
import { devices } from '../../server/mpsserver'

export async function powerState (req: Request, res: Response): Promise<void> {
  try {
    const guid: string = req.params.guid
    MqttProvider.publishEvent('request', ['AMT_PowerState'], 'Power State Requested', guid)
    const response = await devices[guid].getPowerState()
    if (response?.Envelope?.Body?.PullResponse?.Items?.CIM_AssociatedPowerManagementService?.PowerState) {
      res.status(200).send({ powerstate: response.Envelope.Body.PullResponse.Items.CIM_AssociatedPowerManagementService.PowerState })
    } else {
      MqttProvider.publishEvent('fail', ['AMT_PowerState'], 'Failed to Get Power State', guid)
      log.error(`Request failed during powerstate fetch for guid : ${guid}.`)
      return res.status(400).json(ErrorResponse(400, `Request failed during powerstate fetch for guid : ${guid}.`)).end()
    }
  } catch (error) {
    log.error(`Exception in Power state : ${error}`)
    MqttProvider.publishEvent('fail', ['AMT_PowerState'], 'Internal Server Error')
    return res.status(500).json(ErrorResponse(500, 'Request failed during powerstate fetch.')).end()
  }
}