import { AgentCapabilities } from "@/types/agents";
import { Check, ShieldQuestion, X } from "lucide-react";
import AgentCard from "./AgentCard";

/**
 * Displays a card summarizing the capabilities of an agent.
 *
 * @param pushNotifications - Indicates if push notifications are supported (`true`), not supported (`false`), or unknown (`undefined`).
 * @param stateTransitionHistory - Indicates if state transition history is supported (`true`), not supported (`false`), or unknown (`undefined`).
 * @param streaming - Indicates if streaming is supported (`true`), not supported (`false`), or unknown (`undefined`).
 *
 * Renders a table with each capability and an icon representing its status:
 * - A checkmark for supported
 * - An X for not supported
 * - A shield with a question mark for unknown
 */
const AgentCapabilitiesCard = ({
  pushNotifications,
  stateTransitionHistory,
  streaming,
}: AgentCapabilities) => {
  return (
    <AgentCard title="Capabilities">
      <table className="table table-header-column w-full">
        <tbody>
          <tr>
            <td>Push Notifications</td>
            <td>
              {pushNotifications === true ? (
                <Check className="text-success" />
              ) : pushNotifications === false ? (
                <X className="text-error" />
              ) : (
                <ShieldQuestion />
              )}
            </td>
          </tr>
          <tr>
            <td>State Transition History</td>
            <td>
              {stateTransitionHistory === true ? (
                <Check className="text-success" />
              ) : stateTransitionHistory === false ? (
                <X className="text-error" />
              ) : (
                <ShieldQuestion />
              )}
            </td>
          </tr>
          <tr>
            <td>Streaming</td>
            <td>
              {streaming === true ? (
                <Check className="text-success" />
              ) : streaming === false ? (
                <X className="text-error" />
              ) : (
                <ShieldQuestion />
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </AgentCard>
  );
};

export default AgentCapabilitiesCard;
