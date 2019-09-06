import {Injectable} from '@angular/core';
import {ConnectionService} from "ng-connection-service";


@Injectable()
export class Connectivity
{

  onDevice: boolean;
  isConnected = true;

  constructor(public network: ConnectionService)
  {
  }

  isOnline(): Promise<boolean>
  {
    return new Promise((resolve, reject) =>
    {
      this.network.monitor().subscribe(isConnect =>
      {
        this.isConnected = isConnect;
        resolve(this.isConnected);
      })
    })

  }


}
